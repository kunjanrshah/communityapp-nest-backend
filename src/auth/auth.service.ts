import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Scope,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcryptjs';
import { RegisterInput } from 'src/auth/dto/register.input';
import { Role } from '@prisma/client';

interface Notification {
  user_id: number;
  message: string;
}

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(input: RegisterInput) {
    try {
      // Check mobile uniqueness
      const existingMobile = await this.prisma.user.findFirst({ where: { mobile: input.mobile } });
      if (existingMobile) {
        throw new BadRequestException('Mobile is already registered');
      }

      // Check email uniqueness
      const existingEmail = await this.prisma.user.findFirst({ where: { email: input.email } });
      if (existingEmail) {
        throw new BadRequestException('Email is already registered');
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            first_name: input.first_name,
            last_name_id: input.last_name_id,
            email: input.email,
            mobile: input.mobile,
            password: hashedPassword, // Store hashed password
            sub_community_id: input.sub_community_id,
            local_community_id: input.local_community_id,
            gender: input.gender,
            profile_pic: input.profile_pic,
            status: input.status,
          },
        });

        const userAddressData = {
          user_id: user.id,
          address: input.address,
          city_id: input.city_id,
          states_id: input.states_id,
        };

        await tx.userAddress.create({
          data: userAddressData,
        });

        const subcaste = await tx.subCast.findFirst({
          where: { id: user.last_name_id },
          select: { name: true },
        });

        // Fire-and-forget notification (don't block registration)
        this.sendNotification(
          user.id,
          user.first_name,
          subcaste?.name ?? '',
          user.local_community_id,
          user.sub_community_id,
        ).catch((notifyError) => {
          console.error('Notification failed (non-blocking):', notifyError);
        });

        return this.generateTokens(user.id, user.mobile, user.role);
      });
      return result;
    } catch (error) {
      // If it's already an HTTP exception (like BadRequestException), re-throw it directly
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle Prisma known request errors (e.g., unique constraint violations)
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) ?? [];
          if (target.includes('email')) {
            throw new BadRequestException('Email is already registered');
          }
          if (target.includes('mobile')) {
            throw new BadRequestException('Mobile is already registered');
          }
          throw new BadRequestException('A record with this value already exists');
        }
        throw new BadRequestException('Database error occurred during registration');
      }

      // Log the actual error for debugging
      console.error('Registration error:', error);

      // Only throw InternalServerErrorException for truly unknown errors
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
          ? error
          : 'An unexpected error occurred during registration';
      throw new InternalServerErrorException(message);
    }
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      return this.generateTokens(decoded.id, decoded.mobile, decoded.role);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : 'An unexpected error occurred';
      throw new UnauthorizedException('Invalid refresh token', message);
    }
  }

  generateTokens(userId: number, mobile: string, role: string) {
    const payload = { id: userId, mobile, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '35m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, message: 'Success' };
  }

  async login(mobile: string, password: string) {
    const user = await this.validateUser(mobile, password);

    // Generate both access & refresh tokens
    return this.generateTokens(user.id, user.mobile, user.role);
  }

  private async sendNotification(
    userId: number,
    firstName: string,
    lastName: string,
    localCommunityId: number,
    subCommunityId: number,
  ) {
    let adminTokens = await this.getAdminTokens(localCommunityId, Role.LOCAL_ADMIN);

    if (adminTokens.length === 0) {
      adminTokens = await this.getAdminTokens(subCommunityId, Role.SUB_ADMIN);
    }

    if (adminTokens.length === 0) {
      adminTokens = await this.getAdminTokens(null, Role.SUPER_ADMIN);
    }

    if (adminTokens.length > 0) {
      const textMsg = `Please approve ${firstName} ${lastName}'s Request`;
      const notify = {
        user_id: userId,
        message: textMsg,
      };

      await this.sendAndroidNotification(notify, adminTokens);
    }
  }

  private async getAdminTokens(communityId: number | null, role: Role): Promise<string[]> {
    if (role !== Role.SUPER_ADMIN && communityId === null) return [];

    const where =
      role === Role.LOCAL_ADMIN
        ? { role, local_community_id: communityId }
        : role === Role.SUB_ADMIN
        ? { role, sub_community_id: communityId }
        : { role };

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });

    const userIds = users.map((user) => user.id);

    if (userIds.length === 0) return [];

    const deviceTokens = await this.prisma.tkn_devices.findMany({
      where: { user_id: { in: userIds } },
      select: { tokens: true },
    });

    return deviceTokens.map((device) => device.tokens).filter((token) => token.length > 10);
  }

  private async sendAndroidNotification(
    notification: Notification,
    tokens: string[],
  ): Promise<void> {
    // Implement the push notification logic here
    console.log('Sending notification:', notification, 'to tokens:', tokens);
  }

  async validateUser(mobile: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { mobile },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid mobile');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    return user;
  }

  async checkVersionExists(version: number): Promise<boolean> {
    const versionExists = await this.prisma.appVersion.findFirst({ where: { version } });
    return !!versionExists;
  }

  /**
   * Mirrors the legacy "GetUpdatedVersion" REST endpoint data payload — the
   * full AppVersion record that the Android/iOS apps compare against the
   * version number they bundle.
   */
  async getAppVersion() {
    return this.prisma.appVersion.findFirst({
      orderBy: { id: 'desc' },
    });
  }

  async updateDeviceToken(userId: number, token: string): Promise<boolean> {
    // Check if the device token already exists for the user
    const existingDevice = await this.prisma.tkn_devices.findFirst({
      where: { user_id: userId },
    });

    if (existingDevice) {
      // Update the existing token
      await this.prisma.tkn_devices.update({
        where: { id: existingDevice.id },
        data: { tokens: token },
      });
    } else {
      // Create a new entry
      await this.prisma.tkn_devices.create({
        data: { user_id: userId, tokens: token, types: 1 },
      });
    }
    return true;
  }
}
