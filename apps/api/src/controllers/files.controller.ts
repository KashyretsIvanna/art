import { Readable } from 'stream';

import { AccessComposition } from '@app/common/shared';
import { FilesService } from '@app/components/files';
import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('files')
@AccessComposition()
@Controller('files')
export class FilesController {
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

  @Get('message-attachment/:id')
  async getMessageAttachment(
    @Param('id') fileId: number,
    @Res({ passthrough: true }) res: Response
  ) {
    const file = await this.filesService.getMessageAttachment(fileId);

    res.set({
      //eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': file.mimetype,
      //eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Disposition': `attachment; filename="${file.name}"`,
    });

    const fileStream = Readable.from(file.contents[0]);

    return new StreamableFile(fileStream);
  }

  @Get('avatar/:id')
  async getAvatar(
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
