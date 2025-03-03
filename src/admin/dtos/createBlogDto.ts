// src/blogs/dto/blog.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class AdminCreateBlogDto {
  @ApiProperty({
    description: 'Title of the blog',
    example: 'My First Blog'
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Short description of the blog',
    example: 'This is a short description of my first blog.'
  })
  @IsString()
  @IsNotEmpty()
  shortdescription: string;

  @ApiProperty({
    description: 'Full description of the blog',
    example: 'This is the full description of my first blog.'
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Blog banner image',
    example: 'image url'
  })
  @IsOptional()
  @IsString()
  image: string;
}
