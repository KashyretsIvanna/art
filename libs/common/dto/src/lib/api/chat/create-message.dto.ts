import { IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateMessageReq {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  content?: string;

  @IsNumber()
  roomId: number;

  @IsOptional()
  @IsString()
  attachment?: string;
}
