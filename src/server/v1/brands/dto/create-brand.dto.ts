import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBrandDto {
    @ApiProperty({ description: 'Name of the brand', example: 'Toyota' })
    @IsNotEmpty()
    @IsString()
    name: string;
  
    @ApiProperty({ description: 'Description of the brand', example: 'Toyota is a leading car manufacturer.' })
    @IsNotEmpty()
    @IsString()
    description: string;
  
    @ApiProperty({ description: 'Category ID of the brand', example: '638a5b9f4f3c2d9baf4b2d9f' })
    @IsNotEmpty()
    @IsString()
    category: string;

    
    @ApiProperty({
        description: 'Logo URL or path for the brand',
        example: 'https://example.com/image.jpg',
    })
    @IsNotEmpty()
    @IsString()
    logo: string;
}
