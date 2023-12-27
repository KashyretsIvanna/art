export interface UploadProfilePhotoOptions {
  mimetype: string;
  contents: Buffer;
  userId: number;
  order: number;
}

export interface UploadMessageAttachmentOptions {
  mimetype: string;
  contents: Buffer;
}

export interface UploadAvatarOptions {
  mimetype: string;
  contents: Buffer;
  profileId: number;
}
