import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AdminCreateBrandDto {
    @ApiProperty({ description: 'Name of the brand', example: 'Toyota' })
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @ApiProperty({ description: 'Description of the brand', example: 'Toyota is a leading car manufacturer.' })
    @IsNotEmpty()
    @IsString()
    description: string;
  
    @ApiProperty({ description: 'Category for the brand', example: 'Bike' })
    @IsNotEmpty()
    @IsString()
    category: string;

    
    @ApiProperty({
        description: 'Logo URL or path for the brand',
        example: 'https://example.com/image.jpg',
    })
    @IsOptional()
    @IsString()
    logo: string;
}
