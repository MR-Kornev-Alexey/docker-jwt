import { Controller, Post, Body, HttpCode, Param, Get } from '@nestjs/common';
import { ObjectService } from './object.service';
import {ObjectFormInput} from '../types/objectFormInput'

@Controller('objects')
export class ObjectController {
    constructor(private readonly objectService: ObjectService) {}
    @Post('create_new_object')
    @HttpCode(200)
    async createObject(@Body() dto: ObjectFormInput) {
        return await this.objectService.createNewObject(dto);
    }
    @Post('get_all_objects')
    @HttpCode(200)
    async getAllObject(@Body() dto: {email: string }) {
        return await this.objectService.getAllObject(dto);
    }

}

