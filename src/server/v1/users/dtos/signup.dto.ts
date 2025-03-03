import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    description: 'Firstname',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({
    description: 'Lastname',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty({
    description: 'Email',
    example: 'user@vehiclemarket.com',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Country code',
    example: '+91',
  })
  @IsNotEmpty()
  @IsString()
  country_code: string;

  @ApiProperty({
    description: 'Mobile number',
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