import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { SensorsDataService } from './sensor-data.service';
import { CheckService } from '../check/check.service';

@Controller('sensors_data')
export class SensorsDataController {
  constructor(
    private readonly sensorsDataService: SensorsDataService,
    private checkService: CheckService,
  ) {}
  @Post('get_sensors_data')
  @HttpCode(200)
  async getSensorsData(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorsDataService.getSensorsData(dto);
  }
  @Post('get_last_values_data_for_selected_sensors')
  @HttpCode(200)
  async getLastValuesDataForSelectedObjectsAnsSensors(@Body() dto: any) {
    const checkAccess = await this.checkService.checkAllUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorsDataService.getLastValuesDataForSelectedObjectsAnsSensors(
      dto,
    );
  }

  @Post('get_last_values_data_for_dynamic_charts')
  @HttpCode(200)
  async getLastValuesDataForDynamicCharts(@Body() dto: any) {
    const checkAccess = await this.checkService.checkAllUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorsDataService.getLastValuesDataForDynamicCharts(dto);
  }

  @Post('get_selected_sensors_last_data')
  @HttpCode(200)
  async getSelectedSensorsLastData(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorsDataService.getSelectedSensorsLastData(dto);
  }
  @Post('get_one_sensors_last_data')
  @HttpCode(200)
  async getOneSensorsLastData(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorsDataService.getOneSensorsLastData(dto);
  }

  @Post('get_grouped_data_for_selected_object')
  @HttpCode(200)
  async getGroupedDataForSelectedObject(@Body() dto: any) {
    const checkAccess = await this.checkService.checkAllUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorsDataService.getGroupedDataForSelectedObject(dto);
  }
  @Post('get_for_line_one_sensors_last_data')
  @HttpCode(200)
  async getForLineOneSensorsLastData(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorsDataService.getForLineOneSensorsLastData(dto);
  }
}
