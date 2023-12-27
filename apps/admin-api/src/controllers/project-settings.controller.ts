import { LimitsSettingsReq } from '@app/common/dto';
import { AccessTokenGuard, AdminGuard } from '@app/common/shared';
import { LimitsService } from '@app/components/limits';
import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('project-settings')
@ApiTags('project-settings')
export class ProjectSettingsController {
  constructor(private limitsService: LimitsService) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, AdminGuard)
  @Patch('/limits')
  async changeLimits(@Body() limitsReq: LimitsSettingsReq) {
    await this.limitsService.changeProjectLimits(limitsReq.newLimits);
  }
}
