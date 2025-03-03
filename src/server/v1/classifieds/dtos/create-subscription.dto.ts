import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
    @ApiProperty({
        description: 'Classified Submmition date',
        example: '2022-01-01',
    })
    @IsNotEmpty()
    @IsDateString()
    submission_date: Date;

    @ApiProperty({
        description: 'Classified Activation date',
        example: '2022-01-01',
    })
    @IsNotEmpty()
    @IsDateString()
    activation_date: Date;
    
    @ApiProperty({
        description: 'Classified Expiry date',
        example: '2022-01-01',
    })
    @IsNotEmpty()
    @IsDateString()
    expiry_date: Date;

    @ApiProperty({
        description: 'Classified Approver Id',
        example: 'approver id',
    })
    @IsNotEmpty()
    @IsString()
    approver_id: string;
}
