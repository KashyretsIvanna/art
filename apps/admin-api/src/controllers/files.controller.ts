import { Readable } from 'stream';

import { AccessTokenGuard, AdminGuard } from '@app/common/shared';
import { FilesService } from '@app/components/files';
import {
  Controller,
  Get,
  Param,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@Controller('files')
@ApiTags('files')
@UseGuards(AccessTokenGuard, AdminGuard)
export class PhotosController {
  constructor(private filesService: FilesService) {}

  @Get('profile-photo/:id')
  async getProfilePhoto(
    @Param('id') fileId: number,
    @Res({ passthrough: true }) res: Response
  ) {
    const file = await this.filesService.getProfilePhoto(fileId);

    res.set({
      //eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': file.mimetype,
      //eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Disposition': `attachment; filename="${file.name}"`,
    });

    const fileStream = Readable.from(file.contents[0]);

    return new StreamableFile(fileStream);
  }
}
