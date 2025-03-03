import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateProfilePictureDto {
  @ApiProperty({
    description: 'Profile picture',
    example: 'John.jpg'
  })
  @IsString()
  avtar: string;

}