import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsArray, ArrayNotEmpty, Min, Max } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({
    description: 'Package Name',
    example: 'Premium Package',
  })
  @IsNotEmpty()
  @IsString()
  package_name: string;

  @ApiProperty({
    description: 'Price of the package',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Features of the package',
    example: ['Featured Listing', 'Priority Support', 'Premium Ads'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({
    description: 'Duration of the package in days',
    example: 30,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({
    description: 'Offer discount in percentage (0-100)',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  offer_discount: number;
}
