import { LoginReq, RegisterReq } from '@app/common/dto';
import { MailService } from '@app/common/mail';
import { PrismaService } from '@app/common/prisma';
import {
  SocialProfileData,
  AppleAuthInfo,
  appleUserName,
} from '@app/common/types';
import { cryptoHelper } from '@app/core/utils';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ProviderType, Role } from '@prisma/client';
import axios from 'axios';
import { compare, hash } from 'bcrypt';

import { TokensHelper } from '../providers/tokens.helper';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private tokensHelper: TokensHelper,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async register(registerData: RegisterReq) {
    const isEmailUsed = await this.prisma.user.findUnique({
      where: { email: registerData.email },
    });

    if (isEmailUsed) {
      throw new BadRequestException('This email is already used');
    }

    registerData.password = await hash(registerData.password, 10);

    const verificationCode = cryptoHelper.generateCode(5);

    await this.mailService.sendEmailVerificationCode(
      registerData.email,
      verificationCode
    );

    const user = await this.prisma.user.create({
      data: {
        ...registerData,
        email: registerData.email.toLowerCase(),
        emailVerificationCode: {
          create: {
            verificationCode,
          },
        },
      },
    });

    return this.generateTokens(user.id);
  }

  async resetPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException("User with this email doesn't exist");
    }

    await this.prisma.resetPasswordCode.deleteMany({
      where: { userId: user.id },
    });

    const resetPasswordCode = cryptoHelper.generateCode(5);

    await this.prisma.resetPasswordCode.create({
      data: { resetPasswordCode, userId: user.id },
    });

    await this.mailService.sendResetPasswordCode(email, resetPasswordCode);
  }

  async resetPasswordCodeValidation(resetPasswordCode: string) {
    const resetPasswordEntity = await this.prisma.resetPasswordCode.findUnique({
      where: { resetPasswordCode },
    });
    if (!resetPasswordEntity) {
      throw new BadRequestException('Reset password code not valid');
    }

    return { isCodeValid: true };
  }

  async resetPasswordConfirmation(resetPasswordCode: string, password: string) {
    const resetPasswordEntity = await this.prisma.resetPasswordCode.findUnique({
      where: { resetPasswordCode },
    });
    if (!resetPasswordEntity) {
      throw new BadRequestException('Reset password code not valid');
    }

    if (resetPasswordEntity.expirationTime < new Date()) {
      await this.prisma.resetPasswordCode.delete({
        where: { id: resetPasswordEntity.id },
      });

      throw new BadRequestException('Reset password code was expired');
    }

    await this.prisma.$transaction(async (tx) => {
      const hashedPassword = await hash(password, 10);

      await Promise.all([
        tx.user.update({
          where: { id: resetPasswordEntity.userId },
          data: { password: hashedPassword },
        }),
        tx.resetPasswordCode.delete({
          where: { id: resetPasswordEntity.id },
        }),
      ]);
    });
  }

  async resendEmailVerification(email: string) {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email },
        select: { id: true, isEmailVerified: true },
      });

      if (!user) {
        throw new BadRequestException('User with this email not found');
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('User already verified email');
      }

      await this.prisma.emailVerificationCode.delete({
        where: { userId: user.id },
      });

      const verificationCode = cryptoHelper.generateCode(5);

      await this.mailService.sendEmailVerificationCode(email, verificationCode);

      await tx.emailVerificationCode.create({
        data: { verificationCode, userId: user.id },
      });
    });
  }

  async getGoogleProfileInfo(accessToken: string) {
    const res = await axios
      .get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
      )
      .catch((err) => {
        throw new BadRequestException(err.response.data.error_description);
      });

    if (res.status !== 200) {
      throw new BadRequestException('Unexpected server error');
    }

    const userSocialProfile: SocialProfileData = {
      providerType: ProviderType.GOOGLE,
      name: res.data.name,
      email: res.data.email,
      providerUserId: res.data.sub,
    };

    return userSocialProfile;
  }

  async getFacebookProfileInfo(accessToken: string) {
    const res = await axios.get(
      `https://graph.facebook.com/me?fields=email,name&access_token=${accessToken}`
    );

    if (res.status !== 200) {
      throw new BadRequestException('Unexpected server error');
    }

    const userSocialProfile: SocialProfileData = {
      providerType: ProviderType.FACEBOOK,
      name: res.data.name,
      email: res.data.email,
      providerUserId: res.data.id,
    };

    return userSocialProfile;
  }

  async getAppleProfileInfo(accessToken: string) {
    const decodedObject = this.jwtService.decode(accessToken) as AppleAuthInfo;

    if (!decodedObject) {
      throw new BadRequestException('Invalid access token');
    }

    const userSocialProfile: SocialProfileData = {
      providerType: ProviderType.APPLE,
      name:
        (decodedObject.givenName || 'Apple') +
        ' ' +
        (decodedObject.familyName || 'User'),
      email: decodedObject.email,
      providerUserId: decodedObject.sub,
    };

    return userSocialProfile;
  }

  async getAppleName(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new BadRequestException("User doesn't exist");
    }

    return { isUserHaveName: user.name !== appleUserName };
  }

  async setAppleName(id: number, name: string) {
    await this.prisma.user.update({ where: { id }, data: { name } });
  }

  async socialLogin(accessToken: string, providerType: ProviderType) {
    let userSocialProfile;
    switch (providerType) {
      case ProviderType.GOOGLE: {
        userSocialProfile = await this.getGoogleProfileInfo(accessToken);
        break;
      }
      case ProviderType.FACEBOOK: {
        userSocialProfile = await this.getFacebookProfileInfo(accessToken);
        break;
      }
      case ProviderType.APPLE: {
        userSocialProfile = await this.getAppleProfileInfo(accessToken);
        break;
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { email: userSocialProfile.email.toLowerCase() },
      include: { socialAccounts: true },
    });

    if (!user) {
      return this.socialRegister(userSocialProfile);
    }

    const socialAccount = user.socialAccounts.filter(
      (account) => account.provider === providerType
    )[0];

    if (!socialAccount) {
      await this.addSocialAccount(
        user.id,
        providerType,
        userSocialProfile.providerUserId
      );
    }

    return this.generateTokens(user.id);
  }

  async socialRegister(socialRegisterData: SocialProfileData) {
    const user = await this.prisma.user.create({
      data: {
        email: socialRegisterData.email.toLowerCase(),
        name: socialRegisterData.name,
        isEmailVerified: true,
        socialAccounts: {
          create: {
            provider: socialRegisterData.providerType,
            providerUserId: socialRegisterData.providerUserId,
          },
        },
      },
      select: { id: true },
    });

    return this.generateTokens(user.id);
  }

  addSocialAccount(
    userId: number,
    provider: ProviderType,
    providerUserId: string
  ) {
    return this.prisma.socialAccount.create({
      data: { provider, providerUserId, userId },
    });
  }

  async generateTokens(userId: number) {
    const tokens = await this.tokensHelper.generateAccessRefreshPair(userId);

    await this.tokensHelper.updateRefreshToken(userId, tokens.refreshToken);

    return { ...tokens };
  }

  async refreshTokens(refreshToken: string) {
    const user = await this.tokensHelper.findUserByRefreshToken(refreshToken);

    if (!user) {
      throw new ForbiddenException('Invalid refresh token');
    }

    return this.generateTokens(user.id);
  }

  async verifyEmail(verificationCode: string) {
    const verificationCodeEntity =
      await this.prisma.emailVerificationCode.findUnique({
        where: { verificationCode },
      });

    if (!verificationCodeEntity) {
      throw new BadRequestException('Invalid verification code');
    }

    if (verificationCodeEntity.expirationTime < new Date()) {
      if (!verificationCodeEntity.email) {
        this.prisma.user.delete({
          where: { id: verificationCodeEntity.userId },
        });
      }

      this.prisma.emailVerificationCode.delete({
        where: { id: verificationCodeEntity.id },
      });

      throw new BadRequestException('Verification code was expired');
    }

    if (verificationCodeEntity.email) {
      await Promise.all([
        this.prisma.user.update({
          where: { id: verificationCodeEntity.userId },
          data: { email: verificationCodeEntity.email },
        }),

        this.prisma.emailVerificationCode.delete({
          where: { id: verificationCodeEntity.id },
        }),
      ]);

      return;
    }

    await Promise.all([
      this.prisma.user.update({
        where: { id: verificationCodeEntity.userId },
        data: { isEmailVerified: true },
      }),

      this.prisma.emailVerificationCode.delete({
        where: { id: verificationCodeEntity.id },
      }),
    ]);
  }

  async login({ email, password }: LoginReq) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, password: true, role: true },
    });

    if (!user || !user.password) {
      throw new BadRequestException('User with this email doesn’t exist!');
    }

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Login failed');
    }

    const tokens = this.generateTokens(user.id);

    return { tokens, isAdmin: user.role === Role.ADMIN };
  }

  async findUserByToken(accessToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      return this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          profile: {
            select: {
              id: true,
            },
          },
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async logout(userId: number) {
    await this.prisma.refreshToken.delete({ where: { userId } });
  }

  async verifyPassword(password: string, userPassword: string) {
    return { isPasswordMatch: await compare(password, userPassword) };
  }

  async createUserThroughAdmin(registerData: RegisterReq, userType: Role) {
    const isEmailUsed = await this.prisma.user.findUnique({
      where: { email: registerData.email.toLowerCase() },
    });

    if (isEmailUsed) {
      throw new BadRequestException('This email is already used');
    }

    registerData.password = await hash(registerData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...registerData,
        isEmailVerified: true,
        role: userType,
      },
      select: { id: true },
    });

    return { tokens: await this.generateTokens(user.id), id: user.id };
  }
}
