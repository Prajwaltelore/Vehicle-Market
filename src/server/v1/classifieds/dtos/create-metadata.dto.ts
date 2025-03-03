import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateMetadataDto {
    @ApiProperty({
        description: 'SEO - Meta Keywords',
        example: 'keyword1, keyword2, keyword3, keyword-n',
    })
    @IsOptional()
    @IsString()
    keyword?: string;

    @ApiProperty({
        description: 'SEO - Meta Description',
        example: 'description',
    })
    @IsOptional()
    @IsString()
    description?: string;
}
