import { IsNotEmpty, IsEnum, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {

    @ApiProperty({
        description: 'Mobile Number',
        example: 1234567890,
    })
    @IsNotEmpty()
    @IsNumber()
    mobile: number;

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
