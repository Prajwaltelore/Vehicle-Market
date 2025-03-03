import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPasswordOtpDto {

    @ApiProperty({
        description: 'Mobile Number',
        example: 9158822456,
    })
    @IsNotEmpty()
    @IsString()
    mobile: number;
}
