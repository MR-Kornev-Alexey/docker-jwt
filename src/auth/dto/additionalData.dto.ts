import {ApiProperty} from '@nestjs/swagger';
import {IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class additionalDataDto {

    @ApiProperty()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    surName: string;

    @ApiProperty()
    @IsNotEmpty()
    telegram: string;

    @ApiProperty()
    @IsNotEmpty()
    position: string;

    @ApiProperty()
    @IsNotEmpty()
    phone: string;

    @ApiProperty()
    @IsNotEmpty()
    user_id: string;

}
