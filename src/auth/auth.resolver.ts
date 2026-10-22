import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from 'src/auth/dto/login.input';
import { AuthResponse, LoginResponse, RegisterInput } from 'src/auth/dto/register.input';
import { Public } from 'src/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from './email.service';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { ForgotPasswordInput } from './dto/forgot-password.input';
import { ResetPasswordInput } from './dto/reset-password.input';
import { SendMailInput } from './dto/send-mail.input';
import { AppVersionDto } from './dto/model/app-version.dto';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) { }

  @Public()
  @Mutation(() => AuthResponse)
  async register(@Args('RegisterInput') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Public()
  @Mutation(() => LoginResponse)
  async login(@Args('LoginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput.mobile, loginInput.password);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async refreshToken(@Args('token') token: string) {
    return this.authService.refreshToken(token);
  }

  @Mutation(() => Boolean)
  async updateDeviceToken(@Context() context): Promise<boolean> {
    const userId = context.req.user.userId; // Get user ID from authenticated request
    const deviceToken = context.req['deviceToken']; // Extract from request
    console.log('deviceToken: ', deviceToken);
    console.log('userId: ', userId);
    if (!userId || !deviceToken) {
      throw new Error('User ID or Device Token is missing');
    }

    return this.authService.updateDeviceToken(userId, deviceToken);
  }

  @Public()
  @Mutation(() => String)
  async forgotPassword(@Args('forgotPasswordInput') forgotPasswordInput: ForgotPasswordInput) {
    const { resetType } = forgotPasswordInput;

    // Mirror the legacy CodeIgniter ForgotPassword API which accepts
    // `reset_type` = 'mobile' | 'email' plus a `username` (mobile no. or email).
    let user;
    let lookupLabel: string;

    if (resetType === 'mobile') {
      if (!forgotPasswordInput.mobile) throw new Error('Mobile number is required');
      user = await this.prisma.user.findFirst({ where: { mobile: forgotPasswordInput.mobile } });
      lookupLabel = 'Mobile No Does Not Exist';
    } else {
      if (!forgotPasswordInput.email) throw new Error('Email is required');
      user = await this.prisma.user.findFirst({ where: { email: forgotPasswordInput.email } });
      lookupLabel = 'Email Does Not Exist';
    }

    if (!user) throw new Error(lookupLabel);

    // We CANNOT recover the user's original password because passwords are
    // stored as one-way bcrypt hashes. Instead, generate a brand-new temporary
    // password (6 numeric digits, crypto-secure), store its hash, and email
    // the plain text to the user.
    // NOTE: 6 digits = 1,000,000 combinations. Fine as a one-time temporary
    // password, but NOT suitable as a permanent password.
    const temporaryPassword = Array.from({ length: 6 }, () => randomInt(10)).join('');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    // Replace the stored password hash with the temporary one.
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    // Send the temporary password in the email (mirrors the legacy CodeIgniter
    // behaviour of emailing/SMS-ing the plain-text password).
    const destinationEmail = user.email ?? forgotPasswordInput.email;
    if (!destinationEmail) {
      throw new Error('No email on file. Please contact support to reset your password.');
    }

    await this.emailService.sendTemporaryPasswordEmail(destinationEmail, temporaryPassword);

    return resetType === 'mobile'
      ? 'Temporary password sent to your registered email!'
      : 'Temporary password sent to email!';
  }

  // 🔹 Reset Password Mutation
  @Mutation(() => String)
  @Public()
  async resetPassword(@Args('resetPasswordInput') resetPasswordInput: ResetPasswordInput) {
    const { token, password } = resetPasswordInput;

    // If we dont have DB then its other technic to retrive user
    //  const payload = this.jwtService.verify(token);
    // const userId = payload.userId;

    // Find user by token
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
        // Ensure token is not expired
      },
      select: { id: true },
    });

    if (!user) throw new Error('Invalid or expired token');

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password & clear reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    return 'Password successfully reset!';
  }

  @Public()
  @Query(() => Boolean)
  async isAppVersionExists(@Args('version', { type: () => Number }) version: number) {
    return this.authService.checkVersionExists(version);
  }

  @Public()
  @Query(() => AppVersionDto, { nullable: true })
  async getAppVersion() {
    return this.authService.getAppVersion();
  }

  @Mutation(() => String)
  async sendMail(@Args('input') input: SendMailInput): Promise<string> {
    await this.emailService.sendMail(input.toEmail, input.subject, input.body);
    return 'Email sent';
  }
}
