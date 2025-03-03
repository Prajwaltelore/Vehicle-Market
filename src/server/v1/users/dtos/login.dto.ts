import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Country code',
    example: '+91',
  })
  @IsNotEmpty()
  @IsString()
  country_code: string;

  @ApiProperty({
    description: 'mobile number',
    example: 1234567890,
  })
  @IsNotEmpty()
  @IsNumber()
  mobile: number;

  @ApiProperty({
    description: 'Password',
    example: 'password',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}