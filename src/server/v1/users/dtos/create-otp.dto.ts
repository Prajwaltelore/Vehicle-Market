import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString } from 'class-validator';

export class CreateOtpDto {

    @ApiProperty({
        description: 'OTP',
        example: '1234',
    })
    @IsNotEmpty()
    @IsString()
    otp: string;

    @ApiProperty({
        description: 'OTP Type',
        example: 'SMS/EMAIL',
    })
    @IsNotEmpty()
    @IsEnum(['sms', 'email'])
    type: string;
}
