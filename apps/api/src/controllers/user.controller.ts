import {
  GetUserRes,
  IsPremiumRes,
  UpdateRegistrationTokenReq,
} from '@app/common/dto';
import {
  AccessComposition,
  AccessTokenGuard,
  ReqUser,
} from '@app/common/shared';
import { UserService } from '@app/components/user';
import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiResponse({ status: 401, description: 'Invalid token' })
  @Get('me')
  getUserInfo(@ReqUser() { id }: User): Promise<GetUserRes> {
    return this.userService.getUserInfo(id);
  }

  @AccessComposition()
  @Delete('me')
  deleteAccount(@ReqUser() { id }: User) {
    return this.userService.deleteUser(id);
  }

  @AccessComposition()
  @Post('registration-token')
  updateRegistrationToken(
    @Body() { registrationToken }: UpdateRegistrationTokenReq,
    @ReqUser() { id }: User
  ) {
    return this.userService.updateRegistrationToken(id, registrationToken);
  }

  @AccessComposition()
  @Get('/is-premium')
  isPremium(@ReqUser() { id }: User): Promise<IsPremiumRes> {
    return this.userService.isPremium(id);
  }
}
