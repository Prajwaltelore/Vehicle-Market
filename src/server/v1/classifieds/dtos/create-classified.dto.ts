import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { CreateContactDetailsDto } from './create-contactdetails.dto';
import { CreateImagesDto } from './create-images.dto';
import { CreateMetadataDto } from './create-metadata.dto';
import { CreateSubscriptionDto } from './create-subscription.dto';

export class CreateClassifiedDto {
    @ApiProperty({
        description: 'Classified Title',
        example: 'Title',
    })
    @IsNotEmpty()
    @IsString()
    title: string;

    // @ApiProperty({
    //     description: 'Classified URL Slug',
    //     example: 'url-slug',
    // })
    // @IsOptional()
    // @IsNotEmpty()
    // @IsString()
    // url_slug: string;

    // @ApiProperty({
    //     description: 'Classified Shortcode',
    //     example: 'shortcode',
    // })
    // @IsOptional()
    // @IsNotEmpty()
    // @IsString()
    // shortcode: string;

    @ApiProperty({
        description: 'Classified Description',
        example: 'description',
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Classified Offer Price',
        example: 1000,
    })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({
        description: 'Classified Main Category',
        example: 'category id',
    })
    @IsNotEmpty()
    @IsString()
    category: string;

    @ApiProperty({
        description: 'Classified Brand',
        example: 'brand id',
    })
    @IsNotEmpty()
    @IsString()
    brand: string;

    @ApiProperty({
        description: 'Classified Model',
        example: 'model name',
    })
    @IsNotEmpty()
    @IsString()
    model: string;

    @ApiProperty({
        description: 'Classified Manufactur Year',
        example: 2000,
    })
    @IsNotEmpty()
    @IsNumber()
    manufactur_year: number;

    @ApiProperty({
        description: 'Vehicle Kms Driven',
        example: 1000,
    })
    @IsNotEmpty()
    @IsNumber()
    kms_driven: number;

    @ApiProperty({
        description: 'Rental Unit',
        example: 'day/month/hour/ton/KG etc',
    })
    @IsOptional()
    @IsString()
    rental_unit: string;

    @ApiProperty({
        description: 'Classified Type',
        example: 'sell/rent',
    })
    @IsNotEmpty()
    @IsEnum(['sell', 'rent'])
    classified_type: string;

    @ApiHideProperty()
    @IsOptional()
    @IsString()
    user: string;

    // @ApiProperty({
    //     description: 'Classified Badge',
    //     example: 'regular/premium/featured/gold',
    // })
    // @IsOptional()
    // @IsNotEmpty()
    // @IsEnum(['regular', 'premium', 'featured', 'gold'])
    // classified_badge: string;

    // @ApiProperty({
    //     description: 'Classified Views',
    //     example: 1000,
    // })
    // @IsOptional()
    // @IsNotEmpty()
    // @IsNumber()
    // views: number;

    // @ApiProperty({
    //     description: 'Classified Likes',
    //     example: 1000,
    // })
    // @IsOptional()
    // @IsNotEmpty()
    // @IsNumber()
    // likes: number;

    @ApiProperty({
        description: 'Contact Details',
    })
    @IsNotEmpty()
    @IsObject()
    contact_details: CreateContactDetailsDto;

    @ApiProperty({
        description: 'Country ID',
        example: 212,
    })
    @IsNotEmpty()
    @IsNumber()
    country: number;

    @ApiProperty({
        description: 'State ID',
        example: 3021,
    })
    @IsNotEmpty()
    @IsNumber()
    state: number;

    @ApiProperty({
        description: 'City ID',
        example: 4521,
    })
    @IsNotEmpty()
    @IsNumber()
    city: number;

    @ApiProperty({
        description: 'Address',
        example: 'Street Address detaiils',
    })
    @IsNotEmpty()
    @IsString()
    address: string;

    @ApiProperty({
        description: 'Classified Location',
        example: {
            type: 'Point',
            coordinates: [19.72, 45.26],
        },
    })
    @IsNotEmpty()
    @IsObject()
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };

    // @ApiProperty({
    //     description: 'Classified Images',
    //     example: [],
    // })
    // @IsOptional()
    // @IsArray()
    // images: CreateImagesDto[];

    // @ApiProperty({
    //     description: 'SEO Meta tags and description',
    // })
    // @IsOptional()
    // @IsObject()
    // meta: CreateMetadataDto;

    // @ApiProperty({
    //     description: 'Subscription',
    // })
    // @IsOptional()
    // @IsObject()
    // subscription: CreateSubscriptionDto;

    // @ApiProperty({
    //     description: 'Classified Status',
    //     example: 'draft/inprocess/active/expired/trash/sold/rejected',
    // })
    // @IsOptional()
    // @IsNotEmpty()
    // @IsEnum(['draft', 'inprocess', 'active', 'expired', 'trash', 'sold', 'rejected'])
    // status: boolean;

    // @IsOptional()
    // @IsBoolean()
    // deleted?: boolean;
}
