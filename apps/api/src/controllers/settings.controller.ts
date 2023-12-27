import {
  LimitsSettingsReq,
  UserReq,
  UserSettingsReq,
  UserSettingsRes,
} from '@app/common/dto';
import { AccessComposition, ReqUser } from '@app/common/shared';
import { LimitsService } from '@app/components/limits';
import { UserService } from '@app/components/user';
import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('settings')
@AccessComposition()
@Controller('settings')
export class SettingsController {
  constructor(
    private userService: UserService,
    private limitsService: LimitsService
  ) {}

  @Patch('')
  patchUserSettings(
    @Body() userSettingsData: UserSettingsReq,
    @ReqUser() user: UserReq
  ) {
    return this.userService.patchUserSettings(user.id, userSettingsData);
  }

  @Get('')
  getSettings(@ReqUser() user: UserReq): Promise<UserSettingsRes> {
    return this.userService.getSettings(user);
  }

  @Patch('/limits')
  async changeLimits(@Body() limitsReq: LimitsSettingsReq) {
    await this.limitsService.changeProjectLimits(limitsReq.newLimits);
  }
}
