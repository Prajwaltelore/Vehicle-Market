import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpdateBlogDto {
    @ApiProperty({
      description: 'Title of the blog',
      example: 'My Updated Blog'
    })
    @IsString()
    @IsNotEmpty()
    title: string;
  
    @ApiProperty({
      description: 'Short description of the blog',
      example: 'This is an updated short description of my blog.'
    })
    @IsString()
    @IsNotEmpty()
    shortdescription: string;
  
    @ApiProperty({
      description: 'Full description of the blog',
      example: 'This is the updated full description of my blog.'
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
      description: 'Blog banner image',
      example: 'image url'
    })
    @IsNotEmpty()
    image: string;
}