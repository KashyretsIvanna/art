import { FullGalleryTypeDto } from '@app/common/dto';
import { AccessComposition } from '@app/common/shared';
import { GalleryTypesService } from '@app/components/gallery-types';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('gallery-type')
@ApiTags('gallery-type')
@AccessComposition()
export class GalleryTypesController {
  constructor(private galleryTypesService: GalleryTypesService) {}

  @ApiOperation({ summary: 'Get gallery types' })
  @Get()
  getGalleryTypes(): Promise<FullGalleryTypeDto[]> {
    return this.galleryTypesService.getGalleryTypes();
  }
}
