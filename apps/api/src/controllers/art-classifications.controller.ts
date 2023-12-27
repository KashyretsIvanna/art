import { FullClassificationDto, UserRoleReq } from '@app/common/dto';
import { AccessComposition } from '@app/common/shared';
import { ArtClassificationsService } from '@app/components/art-classifications';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('art-classification')
@ApiTags('art-classification')
@AccessComposition()
export class ArtClassificationsController {
  constructor(private artClassificationsService: ArtClassificationsService) {}

  @ApiOperation({ summary: 'Get classifications by role' })
  @Post()
  getClassifications(
    @Body() body: UserRoleReq
  ): Promise<FullClassificationDto[]> {
    return this.artClassificationsService.getClassifications(body.role);
  }
}
