import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Firstname',
    example: 'John'
  })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({
    description: 'Lastname',
    example: 'Doe'
  })
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty({
    description: 'Email',
    example: 'user@vehiclemarket.com'
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Country id',
    example: 123
  })
  @IsOptional()
  @IsNumber()
  country: number;

  @ApiProperty({
    description: 'State id',
    example: 123
  })
  @IsOptional()
  @IsNumber()
  state: number;

  @ApiProperty({
    description: 'City id',
    example: 123
  })
  @IsOptional()
  @IsNumber()
  city: number;
}