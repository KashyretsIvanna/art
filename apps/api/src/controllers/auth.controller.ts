import {
  AppleUserNameReq,
  AppleUserNameRes,
  EmailVerificationReq,
  GetPhoneNumberReq,
  LoginReq,
  RefreshTokensReq,
  RegisterReq,
  ResetPasswordCodeValidationReq,
  ResetPasswordCodeValidationRes,
  ResetPasswordConfirmationReq,
  ResetPasswordReq,
  SocialLoginReq,
  TokensRes,
  VerifyEmailReq,
  VerifyPasswordReq,
  VerifyPasswordRes,
  VerifyPhoneNumberReq,
} from '@app/common/dto';
import { AccessTokenGuard, ReqUser } from '@app/common/shared';
import { AuthService, SmsService } from '@app/components/auth';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProviderType, User } from '@prisma/client';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private smsService: SmsService
  ) {}

  @Post('register')
  registerUser(@Body() registerData: RegisterReq): Promise<TokensRes> {
    return this.authService.register(registerData);
  }

  @Post('resend-email-verification')
  resendEmailVerification(@Body() { email }: EmailVerificationReq) {
    return this.authService.resendEmailVerification(email);
  }

  @Post('email-verification')
  verifyEmail(@Body() { verificationCode }: VerifyEmailReq) {
    return this.authService.verifyEmail(verificationCode);
  }

  @Post('reset-password')
  resetPassword(@Body() { email }: ResetPasswordReq) {
    return this.authService.resetPassword(email);
  }

  @Post('reset-password-code')
  resetPasswordCodeValidation(
    @Body() { resetPasswordCode }: ResetPasswordCodeValidationReq
  ): Promise<ResetPasswordCodeValidationRes> {
    return this.authService.resetPasswordCodeValidation(resetPasswordCode);
  }

  @Post('reset-password-confirmation')
  resetPasswordConfirmation(
    @Body() { resetPasswordCode, password }: ResetPasswordConfirmationReq
  ) {
    return this.authService.resetPasswordConfirmation(
      resetPasswordCode,
      password
    );
  }

  @Post('google')
  googleSocialLogin(
    @Body() { accessToken }: SocialLoginReq
  ): Promise<TokensRes> {
    return this.authService.socialLogin(accessToken, ProviderType.GOOGLE);
  }

  @Post('facebook')
  facebookSocialLogin(
    @Body() { accessToken }: SocialLoginReq
  ): Promise<TokensRes> {
    return this.authService.socialLogin(accessToken, ProviderType.FACEBOOK);
  }

  @Post('apple')
  appleSocialLogin(
    @Body() { accessToken }: SocialLoginReq
  ): Promise<TokensRes> {
    return this.authService.socialLogin(accessToken, ProviderType.APPLE);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('apple/name')
  getAppleName(@ReqUser() { id }: User): Promise<AppleUserNameRes> {
    return this.authService.getAppleName(id);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('apple/name')
  setAppleName(@Body() { name }: AppleUserNameReq, @ReqUser() { id }: User) {
    return this.authService.setAppleName(id, name);
  }

  @Post('login')
  async login(@Body() loginData: LoginReq): Promise<TokensRes> {
    const { tokens, isAdmin } = await this.authService.login(loginData);

    if (isAdmin) {
      throw new ForbiddenException(
        'Only default users can login through this page'
      );
    }

    return tokens;
  }

  @Post('refresh')
  refreshTokens(@Body() { refreshToken }: RefreshTokensReq) {
    return this.authService.refreshTokens(refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@ReqUser() { id }: User) {
    return this.authService.logout(id);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('password-verification')
  async verifyPassword(
    @Body() { password }: VerifyPasswordReq,
    @ReqUser() user: User
  ): Promise<VerifyPasswordRes> {
    return await this.authService.verifyPassword(password, user.password);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('sms/initiate-verification')
  async initiatePhoneNumberVerification(
    @Body() { phoneNumber }: GetPhoneNumberReq,
    @ReqUser() { id }: User
  ): Promise<void> {
    await this.smsService.initiatePhoneVerification(id, phoneNumber);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Post('sms/verify-phone-number')
  async verifyPhoneNumber(
    @Body() { verificationCode }: VerifyPhoneNumberReq,
    @ReqUser() { id, isPhoneVerified, phoneNumber }: User
  ): Promise<void> {
    if (isPhoneVerified) {
      throw new BadRequestException('Phone number is already verified');
    }

    await this.smsService.verifyPhoneNumber(id, phoneNumber, verificationCode);
  }
}
