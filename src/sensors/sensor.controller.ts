import {
  Body,
  Controller, FileTypeValidator,
  HttpCode, HttpException, HttpStatus, MaxFileSizeValidator,
  NestInterceptor, ParseFilePipe, ParseFilePipeBuilder,
  Post,
  Req,
  Type,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SensorService } from './sensor.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { sensorFormInput } from '../types/sensorFormInput';
import { CheckService } from '../check/check.service';

@Controller('sensors')
export class SensorController {
  constructor(private readonly sensorService: SensorService,
              private checkService: CheckService) {
  }

  @Post('set_new_sensor_to_object')
  @HttpCode(200)
  async setNewSensorToObject(@Body() dto: sensorFormInput) {
    return await this.sensorService.createNewSensorToObject(dto);
  }

  @Post('get_all_sensors')
  @HttpCode(200)
  async getAllObject(@Body() dto: { email: string }) {
    return await this.sensorService.getAllSensors(dto);
  }

  @Post('get_all_type_of_sensors')
  @HttpCode(200)
  async getAllTypeOfSensors(@Body() dto: { email: string }) {
    return await this.sensorService.getAllTypeOfSensors(dto);
  }

  @Post('get_all_data_about_one_sensor')
  @HttpCode(200)
  async getAllDataAboutOneSensor(@Body() dto: { email: string, id: string }) {
    return await this.sensorService.getAllDataAboutOneSensor(dto);
  }

  @Post('set_request_data_for_sensor')
  @HttpCode(200)
  async setRequestDataForOneSensor(@Body() dto: { email: string, requestDataForSensor: any }) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.setRequestDataForOneSensor(dto);
  }

  @Post('init_all_new_type_sensor')
  @HttpCode(200)
  async initAllNewTypeSensor(@Body() dto: any) {
    return await this.sensorService.initAllNewTypeSensor(dto);
  }

  @Post('set_additional_data_for_sensor')
  @HttpCode(200)
  async setAdditionalDataForSensor(@Body() dto: any) {
    return await this.sensorService.setAdditionalDataForSensor(dto);
  }

  @Post('set_log_data_for_sensor')
  @HttpCode(200)
  async setLogDataForSensor(@Body() dto: any) {
    return await this.sensorService.setLogDataForSensor(dto);
  }

  @Post('create_new_type_sensor')
  @HttpCode(200)
  async createNewTypeSensor(@Body() dto: any) {
    return await this.sensorService.createNewTypeSensor(dto);
  }

  @Post('change_net_address_for_sensor')
  @HttpCode(200)
  async changeNetNumberForSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeNetNumberForSensor(dto);
  }

  @Post('change_ip_for_sensor')
  @HttpCode(200)
  async changeIPForSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeIPForSensor(dto);
  }

  @Post('import_new_sensors_to_object')
  @HttpCode(200)
  async importNewSensorsToObject(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.importNewSensorsToObject(dto);
  }

  @Post('change_status_one_sensor_from_api')
  @HttpCode(200)
  async changeStatusOneSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeStatusOneSensor(dto);
  }



  @Post('set_null_for_one_sensor')
  @HttpCode(200)
  async setNullForOneSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.setNullForOneSensor(dto);
  }

  @Post('change_null_for_all_charts')
  @HttpCode(200)
  async changeNullForAllCharts(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeNullForAllCharts(dto);
  }
  @Post('change_value_one_sensor_from_api')
  @HttpCode(200)
  async changeValueOneSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeValueOneSensor(dto);
  }

  @Post('change_designation_one_sensor_from_api')
  @HttpCode(200)
  async changeDesignationOneSensorFrom(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeDesignationOneSensorFrom(dto);
  }

  @Post('delete_one_sensor_from_api')
  @HttpCode(200)
  async deleteOneSensorFromApi(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.deleteOneSensorFromApi(dto);
  }

  @Post('change_time_request_sensors')
  @HttpCode(200)
  async changeTimeRequestSensors(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeTimeRequestSensors(dto);
  }

  @Post('change_warning_one_sensor')
  @HttpCode(200)
  async changeWarningOneSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) { // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeWarningOneSensor(dto);
  }

  @Post('save_file_about_sensor')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Body() body: any,
                   @UploadedFile(
                     new ParseFilePipeBuilder()
                       .addFileTypeValidator({
                         fileType: 'pdf',
                       })
                       .addMaxSizeValidator({
                         maxSize: 5000000, // just to you know it's possible.
                       })
                       .build({
                         exceptionFactory(error) {
                           throw new HttpException(error, HttpStatus.BAD_REQUEST);
                         },
                       }),
                   )
                     file: Express.Multer.File) {
    return await this.sensorService.saveFileAboutSensor(file, body.id);
  }
}

