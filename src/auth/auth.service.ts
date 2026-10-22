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
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }

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

    const [profile, memberCount] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          userAddress: { include: { city: true, states: true } },
          userPersonalDetail: {
            include: { native_place: true, gotra: true, current_activity: true },
          },
          userWorkDetail: {
            include: { businessCategory: true, committee: true, designation: true },
          },
          userMatrimony: { include: { birth_place: true } },
          subCast: true,
          occupation: true,
          education: true,
          relation: true,
          localCommunity: true,
          subCommunity: true,
          userLocations: true,
        },
      }),
      this.prisma.user.count({ where: { head_id: user.id } }),
    ]);

    if (!profile) {
      throw new UnauthorizedException('User profile not found');
    }

    const personal = profile.userPersonalDetail;
    const address = profile.userAddress;
    const work = profile.userWorkDetail;
    const matrimony = profile.userMatrimony;
    const locations = profile.userLocations;
    const head =
      profile.head_id === 0
        ? profile
        : await this.prisma.user.findUnique({
          where: { id: profile.head_id },
          select: { first_name: true, last_name_id: true },
        });
    const locationFor = (type: string) =>
      locations.find((location) => location.location_type.toLowerCase() === type);
    const homeLocation = locationFor('home');
    const officeLocation = locationFor('office');
    const currentLocation = locationFor('user');
    const legacyBoolean = (value: boolean | null | undefined) => (value ? '1' : '0');
    const legacyId = (value: number | null | undefined) => String(value ?? 0);
    const legacyDate = (value: Date | null | undefined) => value?.toISOString() ?? '';

    const tokens = this.generateTokens(user.id, user.mobile, user.role);

    return {
      success: true,
      OTP: '',
      message: tokens.message,
      data: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        about_me: matrimony?.about_me ?? '',
        address: address?.address ?? '',
        area: address?.area ?? '',
        birth_date: legacyDate(personal?.birth_date),
        birth_place: matrimony?.birth_place?.name ?? '',
        birth_time: legacyDate(matrimony?.birth_time),
        blood_group: personal?.blood_group ?? '',
        business_address: work?.business_address ?? '',
        business_category: work?.businessCategory?.name ?? '',
        business_category_id: legacyId(work?.business_category_id),
        business_logo: work?.business_logo ?? '',
        business_sub_category: '',
        business_sub_category_id: '0',
        city: address?.city?.name ?? '',
        city_id: legacyId(address?.city_id),
        committee: work?.committee?.name ?? '',
        committee_id: legacyId(work?.committee_id),
        company_name: work?.company_name ?? '',
        created_dt: '0',
        current_activity: personal?.current_activity?.name ?? '',
        current_activity_id: legacyId(personal?.current_activity_id),
        designation: work?.designation?.name ?? '',
        designation_id: legacyId(work?.designation_id),
        distance: '',
        distinct_id: '',
        education: profile.education?.name ?? '',
        education_id: legacyId(profile.education_id),
        email_address: profile.email ?? '',
        expectation: matrimony?.expectation ?? '',
        expire_date: legacyDate(profile.expire_date),
        facebook_profile: matrimony?.facebook_profile ?? '',
        father_name: profile.father_name ?? '',
        first_name: profile.first_name,
        gender: legacyBoolean(profile.gender),
        gotra: personal?.gotra?.name ?? '',
        gotra_id: legacyId(personal?.gotra_id),
        head_id: legacyId(profile.head_id),
        head_name: head?.first_name ?? '',
        head_sub_cast_id: legacyId(head?.last_name_id),
        height: matrimony?.height?.toString() ?? '',
        hobby: matrimony?.hobby ?? '',
        home_lat: homeLocation?.latitude.toString() ?? '',
        home_lng: homeLocation?.longitude.toString() ?? '',
        is_donor: legacyBoolean(personal?.is_donor),
        is_expired: legacyBoolean(profile.is_expired),
        isImportant: false,
        is_location_enable: legacyBoolean(locations.some((location) => location.is_location_enable)),
        is_mangal: legacyBoolean(matrimony?.is_mangal),
        is_rented: legacyBoolean(address?.addr_type === 'RENTED'),
        is_shani: legacyBoolean(matrimony?.is_shani),
        is_spect: legacyBoolean(matrimony?.is_spect),
        last_login: legacyDate(profile.last_login),
        last_name: profile.subCast?.name ?? '',
        local_address: address?.local_address ?? '',
        local_community: profile.localCommunity?.name ?? '',
        local_community_id: legacyId(profile.local_community_id),
        login_status: Number(legacyBoolean(profile.login_status)),
        marital_status: personal?.marital_status ?? '',
        marriage_date: legacyDate(personal?.marriage_date),
        matched: '',
        matrimony: personal?.matrimony ? 'YES' : 'NO',
        member_code: profile.member_code ?? '',
        member_count: memberCount,
        mosaad_id: legacyId(address?.mosaad_id),
        mossad: '',
        mother_name: profile.mother_name ?? '',
        native: personal?.native_place?.name ?? '',
        native_place_id: legacyId(personal?.native_place_id),
        nearBy: '',
        occupation: profile.occupation?.name ?? '',
        occupation_id: legacyId(profile.occupation_id),
        office_lat: officeLocation?.latitude.toString() ?? '',
        office_lng: officeLocation?.longitude.toString() ?? '',
        online_status: 0,
        password: '',
        phone: profile.phone ?? '',
        pincode: address?.pincode ?? '',
        plain_password: '',
        profile_completed: `${profile.profile_percent}%`,
        profile_password: '',
        profile_percentage: profile.profile_percent.toString(),
        profile_pic: profile.profile_pic ?? '',
        region: profile.region ?? '',
        relation: profile.relation?.name ?? '',
        relation_id: legacyId(profile.relation_id),
        sharing_id: currentLocation?.sharing_id ?? '0',
        state: address?.states?.name ?? '',
        state_id: legacyId(address?.states_id),
        status: legacyBoolean(profile.status),
        sub_cast_id: legacyId(profile.last_name_id),
        sub_community: profile.subCommunity?.name ?? '',
        sub_community_id: legacyId(profile.sub_community_id),
        updated_dt: legacyDate(profile.updated),
        user_lat: currentLocation?.latitude.toString() ?? '',
        user_lng: currentLocation?.longitude.toString() ?? '',
        website: work?.website ?? '',
        weight: matrimony?.weight?.toString() ?? '',
        work_details: work?.work_details ?? '',
        matches: null,
        reminder_birth_date: null,
        reminder_marriage_date: null,
        reminder_expire_date: null,
      },
    };
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
