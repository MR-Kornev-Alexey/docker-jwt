import { Controller, Post, Body, HttpCode, Param, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ObjectService } from './object.service';
import { ObjectFormInput } from '../types/objectFormInput';
import { CheckService } from '../check/check.service';

@Controller('objects')
export class ObjectController {
  constructor(private readonly objectService: ObjectService,
              private checkService: CheckService) {
  }

  @Post('create_new_object')
  @HttpCode(200)
  async createObject(@Body() dto: ObjectFormInput) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    } else {
      return await this.objectService.createNewObject(dto);
    }
  }

  @Post('delete_one_object')
  @HttpCode(200)
  async deleteOneObject(@Body() dto: ObjectFormInput) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    } else {
      return await this.objectService.deleteOneObject(dto);
    }
  }


  @Post('get_all_objects')
  @HttpCode(200)
  async getAllObject(@Body() dto: { email: string }) {
    return await this.objectService.getAllObject(dto);
  }

}

