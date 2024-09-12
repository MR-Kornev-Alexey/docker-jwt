import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SensorService } from './sensor.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CheckService } from '../check/check.service';

interface UploadFileDto {
  id: string;
}
@Controller('sensors')
export class SensorController {
  constructor(
    private readonly sensorService: SensorService,
    private checkService: CheckService,
  ) {}

  @Post('set_new_sensor_to_object')
  @HttpCode(200)
  async setNewSensorToObject(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.createNewSensorToObject(dto);
  }

  @Post('one_sensor_duplication')
  @HttpCode(200)
  async setOneSensorDuplicate(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.setOneSensorDuplicate(dto);
  }

  @Post('get_all_sensors')
  @HttpCode(200)
  async getAllSensors(@Body() dto: { email: string }) {
    return await this.sensorService.getAllSensors(dto);
  }

  @Post('get_all_type_of_sensors')
  @HttpCode(200)
  async getAllTypeOfSensors(@Body() dto: { email: string }) {
    return await this.sensorService.getAllTypeOfSensors(dto);
  }

  @Post('get_all_data_about_one_sensor')
  @HttpCode(200)
  async getAllDataAboutOneSensor(@Body() dto: { email: string; id: string }) {
    return await this.sensorService.getAllDataAboutOneSensor(dto);
  }

  @Post('set_request_data_for_sensor')
  @HttpCode(200)
  async setRequestDataForOneSensor(
    @Body() dto: { email: string; requestDataForSensor: any },
  ) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.setRequestDataForOneSensor(dto);
  }

  @Post('init_all_new_type_sensor')
  @HttpCode(200)
  async initAllNewTypeSensor(@Body() dto: any) {
    return await this.sensorService.initAllNewTypeSensor(dto);
  }

  @Post('set_additional_parameter_for_sensor')
  @HttpCode(200)
  async setAdditionalParameterForSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.setAdditionalParameterForSensor(dto);
  }
  @Post('set_additional_data_for_sensor')
  @HttpCode(200)
  async setAdditionalDataForSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.setAdditionalDataForSensor(dto);
  }

  @Post('set_log_data_for_sensor')
  @HttpCode(200)
  async setLogDataForSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
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
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeNetNumberForSensor(dto);
  }

  @Post('change_ip_for_sensor')
  @HttpCode(200)
  async changeIPForSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeIPForSensor(dto);
  }

  @Post('import_new_sensors_to_object')
  @HttpCode(200)
  async importNewSensorsToObject(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.importNewSensorsToObject(dto);
  }

  @Post('change_status_one_sensor_from_api')
  @HttpCode(200)
  async changeStatusOneSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccessWithDispatcher(
      dto.email,
    );
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeStatusOneSensor(dto);
  }

  @Post('set_null_for_all_sensor_on_object')
  @HttpCode(200)
  async setNullForAllSensorOnObject(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.setNullForAllSensorOnObject(dto);
  }

  @Post('change_parameters_for_one_object')
  @HttpCode(200)
  async changeParametersForOneObject(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeParametersForOneObject(dto);
  }

  @Post('change_data_for_emission_processing')
  @HttpCode(200)
  async changeDataForEmissionProcessing(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeDataForEmissionProcessing(dto);
  }

  @Post('change_designation_one_sensor_from_api')
  @HttpCode(200)
  async changeDesignationOneSensorFromApi(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeDesignationOneSensorFromApi(dto);
  }
  @Post('change_limit_values_one_sensor')
  @HttpCode(200)
  async changeLimitValuesOneSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeLimitValuesOneSensor(dto);
  }

  @Post('delete_one_sensor_from_api')
  @HttpCode(200)
  async deleteOneSensorFromApi(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.deleteOneSensorFromApi(dto);
  }

  @Post('change_time_request_sensors')
  @HttpCode(200)
  async changeTimeRequestSensors(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.changeTimeRequestSensors(dto);
  }

  @Post('set_request_parameter_for_sensor')
  @HttpCode(200)
  async setRequestParameterForSensor(@Body() dto: any) {
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      // Проверяем, является ли пользователь администратором
      throw new HttpException('Доступ запрещен', HttpStatus.FORBIDDEN);
    }
    return await this.sensorService.setRequestParameterForSensor(dto);
  }

  @Post('save_file_about_sensor')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() body: UploadFileDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 20000000 })
        .build({
          exceptionFactory(error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
          },
        }),
    )
    file: Express.Multer.File,
  ) {
    // console.log('Received body:', body);
    // console.log('Received file:', file);
    if (!body.id) {
      throw new HttpException('Sensor ID is required', HttpStatus.BAD_REQUEST);
    }
    return await this.sensorService.saveFileAboutSensor(file, body.id);
  }
}
