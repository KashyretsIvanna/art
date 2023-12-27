import { FullOrientationDto } from '@app/common/dto';
import { AccessComposition } from '@app/common/shared';
import { ArtOrientationsService } from '@app/components/art-orientations';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('art-orientation')
@ApiTags('art-orientation')
@AccessComposition()
export class ArtOrientationsController {
  constructor(private artOrientationsService: ArtOrientationsService) {}

  @ApiOperation({ summary: 'Get gallery orientations' })
  @Get()
  getOrientations(): Promise<FullOrientationDto[]> {
    return this.artOrientationsService.getOrientations();
  }
}
