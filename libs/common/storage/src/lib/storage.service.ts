import { PrismaService } from '@app/common/prisma';
import {
  UploadAvatarOptions,
  UploadMessageAttachmentOptions,
  UploadProfilePhotoOptions,
} from '@app/common/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { getStorage } from 'firebase-admin/storage';

@Injectable()
export class StorageService {
  bucket = getStorage().bucket();
  constructor(private prisma: PrismaService) {}

  async uploadProfilePhotoToStorage(
    fileName: string,
    options: UploadProfilePhotoOptions
  ) {
    await this.bucket.file(fileName).save(options.contents);

    const savedPhoto = await this.prisma.userPhoto.create({
      data: {
        name: fileName,
        mimetype: options.mimetype,
        userId: options.userId,
        order: options.order,
      },
      select: { id: true },
    });

    return savedPhoto;
  }

  async uploadAvatarToStorage(fileName: string, options: UploadAvatarOptions) {
    await this.bucket.file(fileName).save(options.contents);

    const savedPhoto = await this.prisma.$transaction(async (tx) => {
      const prevAvatar = await tx.profile.findUnique({
        where: { id: options.profileId },
        select: { avatar: { select: { id: true, name: true } } },
      });

      if (prevAvatar?.avatar?.id) {
        await tx.avatar.delete({ where: { id: prevAvatar.avatar.id } });

        await this.bucket.file(prevAvatar.avatar.name).delete();
      }

      const savedPhoto = await tx.avatar.create({
        data: {
          name: fileName,
          mimetype: options.mimetype,
        },
        select: { id: true },
      });

      await tx.profile.update({
        where: { id: options.profileId },
        data: { avatarId: savedPhoto.id },
      });

      return savedPhoto;
    });

    return savedPhoto;
  }

  async uploadMessageAttachmentToStorage(
    fileName: string,
    options: UploadMessageAttachmentOptions
  ) {
    await this.bucket.file(fileName).save(options.contents);

    const savedPhoto = await this.prisma.messageAttachment.create({
      data: {
        name: fileName,
        mimetype: options.mimetype,
      },
      select: { id: true },
    });

    return savedPhoto;
  }

  async getFileUrl(
    fileId: number,
    fileType: 'messageAttachment' | 'profilePhoto' | 'avatar'
  ) {
    let metadata;

    if (fileType === 'messageAttachment') {
      metadata = await this.prisma.messageAttachment.findUnique({
        where: { id: fileId },
      });
    }

    if (fileType === 'profilePhoto') {
      metadata = await this.prisma.userPhoto.findUnique({
        where: { id: fileId },
      });
    }

    if (fileType === 'avatar') {
      metadata = await this.prisma.avatar.findUnique({
        where: { id: fileId },
      });
    }

    if (!metadata) {
      throw new NotFoundException('File not found');
    }

    const contents = await this.bucket.file(metadata.name).download();

    return { contents, ...metadata };
  }

  async deleteProfilePhoto(fileName: string) {
    await this.bucket.file(fileName).delete();
  }
}
