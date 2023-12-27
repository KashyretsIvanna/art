import { FullBoostDto, UserReq } from '@app/common/dto';
import { ProfileAccessComposition, ReqUser } from '@app/common/shared';
import { BoostService } from '@app/components/boost';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('boost')
@ApiTags('boost')
@ProfileAccessComposition()
export class BoostController {
  constructor(private boostService: BoostService) {}

  @ApiOperation({ summary: 'Boost me' })
  @Post()
  boostProfile(@ReqUser() user: UserReq): Promise<FullBoostDto> {
    return this.boostService.boostMe(user);
  }
}
