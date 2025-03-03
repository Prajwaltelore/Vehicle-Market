import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminCreateCategoryDto {
    @ApiProperty({
        description: 'Name of the category',
        example: 'Truck',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Description of the category',
        example: 'This category includes items like Truck, Bike, Car etc.',
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Image URL or path for the category',
        example: 'https://example.com/image.jpg',
    })
    @IsOptional()
    @IsString()
    image: string;
    
}
