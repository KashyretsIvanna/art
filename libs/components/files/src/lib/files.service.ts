import { StorageService } from '@app/common/storage';
import {
  UploadAvatarOptions,
  UploadMessageAttachmentOptions,
  UploadProfilePhotoOptions,
} from '@app/common/types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  constructor(private storageService: StorageService) {}

  async uploadProfilePhoto(options: UploadProfilePhotoOptions) {
    const fileName = uuidv4() + '.' + options.mimetype.split('/')[1]; // :)

    return await this.storageService.uploadProfilePhotoToStorage(
      fileName,
      options
    );
  }

  async uploadAvatar(options: UploadAvatarOptions) {
    const fileName = uuidv4() + '.' + options.mimetype.split('/')[1]; // :)

    return await this.storageService.uploadAvatarToStorage(fileName, options);
  }

  async uploadMessageAttachment(options: UploadMessageAttachmentOptions) {
    const fileName = uuidv4() + '.' + options.mimetype.split('/')[1]; // :)

    return await this.storageService.uploadMessageAttachmentToStorage(
      fileName,
      options
    );
  }

  async getProfilePhoto(fileId: number) {
    return await this.storageService.getFileUrl(fileId, 'profilePhoto');
  }

  async getAvatar(fileId: number) {
    return await this.storageService.getFileUrl(fileId, 'avatar');
  }

  async getMessageAttachment(fileId: number) {
    return await this.storageService.getFileUrl(fileId, 'messageAttachment');
  }

  deleteProfilePhoto(fileName: string) {
    return this.storageService.deleteProfilePhoto(fileName);
  }
}
