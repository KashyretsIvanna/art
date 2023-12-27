import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FullOrientationDto {
  @IsString()
  @IsNotEmpty()
  orientationName: string;

  @IsNumber()
  @IsNotEmpty()
  id: number;
}
