import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerifySmsDto{
  @ApiProperty({
    description: 'mobile number',
    example: 1234567890,
  })
  @IsNotEmpty()
  @IsNumber()
  mobile: number;

  @ApiProperty({
    description: 'OTP',
    example: 1234,
  })
  @IsNotEmpty()
  @IsString()
  otp: string;
}