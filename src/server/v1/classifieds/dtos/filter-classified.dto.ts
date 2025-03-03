import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class FilterClassifiedDto {
  @ApiProperty({
    description: 'Classified Title',
    example: 'Title',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Classified Main Category',
    example: 'category id',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Classified Brand',
    example: 'brand id',
    required: false,
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({
    description: 'Classified Manufactur Year',
    example: 2000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  manufactur_year: number;

  @ApiProperty({ description: 'Minimum price', required: false })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price', required: false })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({
    description: 'Rental Unit',
    example: 'day/month/hour/ton/KG etc',
    required: false,
  })
  @IsOptional()
  @IsString()
  rental_unit: string;

  @ApiProperty({
    description: 'Classified Type',
    example: 'sell/rent',
    required: false,
  })
  @IsOptional()
  @IsEnum(['sell', 'rent'])
  classified_type: string;

  @ApiProperty({
    description: 'Classified Badge',
    example: 'regular/premium/featured/gold',
    required: false,
  })
  @IsOptional()
  @IsEnum(['regular', 'premium', 'featured', 'gold'])
  classified_badge: string;

  @ApiProperty({
    description: 'Classified Location',
    example: {
      type: 'Point',
      coordinates: [19.72, 45.26],
    },
  })
  @IsOptional()
  @IsObject()
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };

  @ApiProperty({ description: 'Search radius in meters', example: 50000 })
  @IsOptional()
  @IsNumber()
  radius: number;

  @ApiProperty({
    description: 'Page number for pagination',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({
    description: 'Number of results per page',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({
    description: 'Sorting order (nearest, badge, timestamp)',
    default: 'nearest',
    required: false,
  })
  @IsOptional()
  @IsEnum(['nearest', 'badge', 'timestamp'])
  sort?: string;

  @ApiProperty({
    description: 'Minimum Distance in Kilometers',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minDistanceKm: number;

  @ApiProperty({
    description: 'Maximum Distance in Kilometers',
    example: 10000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxDistanceKm: number; // Add maxDistanceKm here

  @ApiProperty({
    description: 'Classified Status',
    example: 'draft/inprocess/active/expired/trash/sold/rejected',
    required: false,
  })
  @IsOptional()
  @IsEnum([
    'draft',
    'inprocess',
    'active',
    'expired',
    'trash',
    'sold',
    'rejected',
  ])
  status: boolean;

}
