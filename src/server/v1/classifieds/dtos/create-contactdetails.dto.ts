import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateContactDetailsDto {
    @IsNotEmpty()
    @IsString()
    _id: string;

    @ApiProperty({
        description: 'Owner Type',
        example: 'owner/agent/other',
    })
    @IsNotEmpty()
    @IsEnum(['owner', 'agent', 'other'])
    owner_type: string;

    @ApiProperty({
        description: 'Person Name',
        example: 'Person Name',
    })
    @IsNotEmpty()
    @IsString()
    person_name: string;

    @ApiProperty({
        description: 'Contact Person`s Mobile Number',
        example: '+911234567890',
    })
    @IsNotEmpty()
    @IsString()
    mobile: string;

    @ApiProperty({
        description: 'Whatsapp Availablity',
        example: true,
    })
    @IsNotEmpty()
    @IsBoolean()
    whatsapp: boolean;
}
