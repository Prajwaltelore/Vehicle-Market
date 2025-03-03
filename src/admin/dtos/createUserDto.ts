import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class AdminCreateUserDto {
  @ApiProperty({ description: 'Firstname', example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({ description: 'Lastname', example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty({ description: 'Email', example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Mobile number', example: 1234567890 })
  @IsNotEmpty()
  @IsNumber()
  mobile: number;

  @ApiProperty({ description: 'Country code', example: '+91' })
  @IsNotEmpty()
  @IsString()
  country_code: string;

  @ApiProperty({ description: 'Password', example: 'StrongP@ssw0rd!' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'Country ID', example: 123 })
  @IsOptional()
  @IsNumber()
  country: number;

  @ApiProperty({ description: 'State ID', example: 123 })
  @IsOptional()
  @IsNumber()
  state: number;

  @ApiProperty({ description: 'City ID', example: 123 })
  @IsOptional()
  @IsNumber()
  city: number;

  @ApiProperty({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avtar: string;
}
