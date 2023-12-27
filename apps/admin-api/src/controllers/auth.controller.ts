import { LoginReq, TokensRes } from '@app/common/dto';
import { AuthService } from '@app/components/auth';
import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: LoginReq): Promise<TokensRes> {
    const { tokens, isAdmin } = await this.authService.login(loginData);

    if (!isAdmin) {
      throw new ForbiddenException('Only admin can login through this page');
    }

    return tokens;
  }
}
