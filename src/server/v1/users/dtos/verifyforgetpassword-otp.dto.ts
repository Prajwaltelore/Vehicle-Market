import { IsNotEmpty, IsEnum, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyForgetPasswordOtpDto {
    @ApiProperty({
        description: 'Mobile',
        example: 9158822456,
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
        description: 'Password',
        example: 'password@123',
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
