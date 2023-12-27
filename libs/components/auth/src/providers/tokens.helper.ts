import { FullConfig } from '@app/common/configuration';
import { PrismaService } from '@app/common/prisma';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';

@Injectable()
export class TokensHelper {
  constructor(
    private config: ConfigService<FullConfig, true>,
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async generateAccessRefreshPair(userId: number) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: userId,
        },
        {
          secret: this.config.get('JWT_ACCESS_SECRET'),
          expiresIn: '1h',
        }
      ),
      this.jwt.signAsync(
        {
          sub: userId,
        },
        {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        }
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refresh: string) {
    try {
      const existingRefreshToken = await this.prisma.refreshToken.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (existingRefreshToken) {
        await this.prisma.refreshToken.delete({
          where: { id: existingRefreshToken.id },
        });
      }

      const refreshToken = await hash(refresh, 10);

      await this.prisma.refreshToken.create({ data: { refreshToken, userId } });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async findUserByRefreshToken(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      return await this.prisma.user.findUnique({ where: { id: payload.sub } });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }
  }
}
