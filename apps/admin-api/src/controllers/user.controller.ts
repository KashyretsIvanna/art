import {
  AdminTokensRes,
  ChangePhotoOrderReq,
  EditProfileReq,
  GetAllUsersQueryReq,
  GetAllUsersRes,
  RegisterReq,
  UserSettingsReq,
} from '@app/common/dto';
import { PrismaService } from '@app/common/prisma';
import {
  AccessTokenGuard,
  AdminGuard,
  ValidatedQuery,
} from '@app/common/shared';
import { AuthService } from '@app/components/auth';
import { ProfileService } from '@app/components/profile';
import { UserService } from '@app/components/user';
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

@ApiBearerAuth()
@UseGuards(AccessTokenGuard, AdminGuard)
@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private profileService: ProfileService,
    private prisma: PrismaService
  ) {}

  @Get('/')
  async getAllUsers(
    @ValidatedQuery() { take, page, search }: GetAllUsersQueryReq
  ): Promise<GetAllUsersRes> {
    return this.userService.getAllUsers({take, page, search});
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(+id);
  }

  @Post('/')
  async createUser(@Body() registerData: RegisterReq): Promise<AdminTokensRes> {
    return this.authService.createUserThroughAdmin(registerData, 'USER');
  }

  @Delete('/:id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(+id);
  }

  @Patch('/:id')
  async patchUserSettings(
    @Param('id') id: string,
    @Body() userSettingsData: UserSettingsReq
  ) {
    return this.userService.patchUserSettings(+id, userSettingsData);
  }

  @Patch('/photos/order')
  async reorderPhotos(@Body() { orderedIds }: ChangePhotoOrderReq) {
    return this.profileService.changePhotoOrder(orderedIds);
  }

  @Patch('/:id/profile')
  async editProfile(@Param('id') id: string, @Body() body: EditProfileReq) {
    const user = (await this.prisma.user.findUnique({
      where: { id: +id },
      include: { profile: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;

    return this.profileService.editProfile(user, body);
  }
}
