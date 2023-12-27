import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FullGalleryTypeDto {
  @IsString()
  @IsNotEmpty()
  typeName: string;

  @IsNumber()
  @IsNotEmpty()
  id: number;
}
