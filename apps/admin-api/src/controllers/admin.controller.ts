import {
  AdminTokensRes,
  GetAllAdminsQueryReq,
  GetAllAdminsRes,
  PatchAdminReq,
  RegisterReq,
  TokensRes,
} from '@app/common/dto';
import {
  AccessTokenGuard,
  AdminGuard,
  ReqUser,
  ValidatedQuery,
} from '@app/common/shared';
import { AdminService } from '@app/components/admin';
import { AuthService } from '@app/components/auth';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@Controller('admin')
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminGuard)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  @Get('/')
  getAllAdmins(
    @ValidatedQuery() { take, page }: GetAllAdminsQueryReq
  ): Promise<GetAllAdminsRes> {
    return this.adminService.getAllAdmins(page, take);
  }

  @Post('/')
  createAdmin(@Body() registerData: RegisterReq): Promise<AdminTokensRes> {
    return this.authService.createUserThroughAdmin(registerData, 'ADMIN');
  }

  @Patch('/:id')
  patchAdmin(@Body() patchAdminData: PatchAdminReq, @Param('id') id: string) {
    return this.adminService.patchAdmin(+id, patchAdminData);
  }

  @Delete('/:id')
  deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(+id);
  }

  @Get('/whoami')
  whoami(@ReqUser() user: User) {
    return {
      data: {
        email: user.email,
        role: user.role,
      },
    };
  }
}
