// sensor.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckService } from '../check/check.service';
import { sensorFormInput } from '../types/sensorFormInput';
import * as path from 'path';
import * as fs from 'fs';
import { GetDataSensorService } from '../socketClient/getDataSensor.service';
import e from 'express';

interface JSONData {
  [key: string]: {
    type: string;
    model: string | string[];
  };
}

interface SensorEmissionDto {
  object_id: string;
  model: string;
  limitValue: number;
  emissionsQuantity: number;
  errorsQuantity: number;
  missedConsecutive: number;
  maxQuantity: number,
  minQuantity: number
}
interface Sensor {
  requestSensorInfo: {
    id: number;
    sensor_id: string;
    periodicity: number;
    request_code: string;
    logical_zero: any;
    add_zero: any;
    min: number | null;
    max: number | null;
    base_value: any;
    last_value: any;
    warning: boolean;
    base_zero: number;
  }[];
  name: string;
  id: string;
  sensor_id: string;
  designation: string;
  network_number: number;
  model: string;
  data: string[];
}

@Injectable()
export class SensorService {

  constructor(
    private dbService: PrismaService,
    private checkService: CheckService,
    private getDataSensorService: GetDataSensorService,
  ) {
  }

  async saveSensorsData(objectId, sensorsData) {
    // Проходим по каждой строке в массиве sensorsData
    for (const row of sensorsData) {
      await this.dbService.new_Sensor.create({
        data: {
          object: { connect: { id: objectId } }, // Связываем с объектом по object_id
          sensor_type: row[3],
          sensor_key: row[4],
          model: row[2],
          designation: row[1],
          network_number: parseInt(row[0]), // Преобразуем строку в число
        },
      });
    }
  }

  async sendUpdatedDataOneSensor(id) {
    const oneSensor = await this.dbService.new_Sensor.findFirst({
      where: {
        id: id,
      },
      include: {
        object: true,
        additional_sensor_info: true,
        sensor_operation_log: true,
        files: true,
        requestSensorInfo: true,
        error_information: true,
      },
    });
    console.log(oneSensor);
    return {
      statusCode: HttpStatus.OK,
      message: 'Успешное выполнение операции',
      oneSensor: oneSensor,
    };
  }

  async setRequestDataForOneSensor(dto: { email: string; requestDataForSensor: any }) {
    console.log('dto -', dto);
    try {
      const createRequestDataForSensor = await this.dbService.requestSensorInfo.create({
        data: dto.requestDataForSensor,
      });
      if (createRequestDataForSensor) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Успешная запись данных',
          oneSensor: createRequestDataForSensor,
        };
      } else {
        // Если создание объекта не удалось, выбрасываем ошибку
        throw new Error('Ошибка при записи данных о датчике');
      }

    } catch (error) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при записи данных' };
    }
  }

  async setLogDataForSensor(dto: { email: string; logsData: any }) {
    console.log('dto -', dto);
    try {
      const findSensor = await this.dbService.sensorOperationLog.findFirst({
        where: {
          sensor_id: dto.logsData.sensor_id,
        },
      });

      let logDataForSensor;

      if (findSensor) {
        logDataForSensor = await this.dbService.sensorOperationLog.update({
          where: {
            id: findSensor.id,
          },
          data: dto.logsData,
        });
      } else {
        logDataForSensor = await this.dbService.sensorOperationLog.create({
          data: dto.logsData,
        });
      }
      if (logDataForSensor) {
        return await this.sendUpdatedDataOneSensor(dto.logsData.sensor_id);
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка при записи данных',
        };
      }
    } catch (error) {
      console.error('Ошибка при записи данных:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи данных',
      };
    }
  }

  async setAdditionalDataForSensor(dto: { email: string; additionalDataForSensor: any }) {
    console.log('dto -', dto);
    try {
      const findSensor = await this.dbService.additionalSensorInfo.findFirst({
        where: {
          sensor_id: dto.additionalDataForSensor.sensor_id,
        },
      });

      let additionalDataForSensor;

      if (findSensor) {
        additionalDataForSensor = await this.dbService.additionalSensorInfo.update({
          where: {
            id: findSensor.id,
          },
          data: dto.additionalDataForSensor,
        });
      } else {
        additionalDataForSensor = await this.dbService.additionalSensorInfo.create({
          data: dto.additionalDataForSensor,
        });
      }
      if (additionalDataForSensor) {
        return await this.sendUpdatedDataOneSensor(dto.additionalDataForSensor.sensor_id);
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка при записи данных',
        };
      }
    } catch (error) {
      console.error('Ошибка при записи данных:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи данных',
      };
    }
  }


  async initAllNewTypeSensor(dto: { email: string; jsonData: JSONData }) {
    console.log('dto -', dto);
    // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (checkAccess) {
      try {
        for (const [sensorKey, sensorData] of Object.entries(dto.jsonData)) {
          // Создаем или находим запись в таблице type_Sensor
          await this.dbService.type_Sensor.upsert({
            where: { sensor_key: sensorKey },
            update: {},
            create: {
              sensor_key: sensorKey,
              sensor_type: sensorData.type,
              models: Array.isArray(sensorData.model) ? sensorData.model : [sensorData.model],
            },
          });
        }
        return {
          statusCode: HttpStatus.OK,
          message: 'Успешный запрос',
          allSensors: await this.getAllTypeSensorsFromDb(),
        };
      } catch (error) {
        // Обрабатываем ошибку при создании объекта
        return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при записи данных' };
      }
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }

  async getAllSensorsFromDb() {
    const allSensors = await this.dbService.new_Sensor.findMany({
      include: {
        object: true,
        additional_sensor_info: true, // Включаем связанную модель организации
        sensor_operation_log: true, // Включаем связанные сенсоры
        files: true,
        requestSensorInfo: true,
        error_information: true,
      },
    });
    return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', allSensors: allSensors };
  }

  async getAllTypeSensorsFromDb() {
    const allSensorsType = await this.dbService.type_Sensor.findMany();
    return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', allSensorsType: allSensorsType };
  }


  async setOneSensorDuplicate(dto: sensorFormInput) {
    console.log('dto -- setOneSensorDuplicate', dto);
    try {
      const sensor = await this.dbService.new_Sensor.findUnique({
        where: { id: dto.id },
      });

      if (!sensor) {
        throw new Error('Sensor not found');
      }
      const { id, ...rest } = sensor; // Destructuring to exclude id
      const data = { ...rest, network_number: dto.network_number };

      return await this.createSensorRecord(data, dto.requestData);
    } catch (error) {
      console.error('Error duplicating sensor:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error duplicating sensor: ${error.message}`,
      };
    }
  }

  async createNewSensorToObject(dto: sensorFormInput) {
    console.log('dto -- createNewSensorToObject', dto);
    try {
      return await this.createSensorRecord(dto.sensorsData, dto.requestData);
    } catch (error) {
      console.error('Error creating sensor object:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error creating sensor object: ${error.message}`,
      };
    }
  }

  private async createSensorRecord(sensorData: any, requestData: any) {
    try {
      const createSensor = await this.dbService.new_Sensor.create({ data: sensorData });
      if (!createSensor) {
        throw new Error('Error creating sensor record');
      }
      requestData.sensor_id = createSensor.id;
      const createDataRequest = await this.dbService.requestSensorInfo.create({
        data: requestData,
      });
      const addInfoSensor = {
        sensor_id: createSensor.id,
        coefficient: 1
      }
      const createDataAdd = await this.dbService.additionalSensorInfo.create({
        data: addInfoSensor,
      });
      if (!createDataRequest) {
        throw new Error('Error creating request data record');
      }
      if (!createDataAdd) {
        throw new Error('Error creating request data record');
      }
      return await this.getAllSensorsFromDb();
    } catch (error) {
      console.error('Error in createSensorRecord:', error);
      throw error;
    }
  }


  async getAllSensors(dto: { email: string }) {
    console.log('dto -', dto);
    // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (checkAccess) {
      return await this.getAllSensorsFromDb();
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }


  async getAllDataAboutOneSensor(dto: { email: string, id: string }) {
    console.log('dto -', dto);
    // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (checkAccess) {
      const oneSensor = await this.dbService.new_Sensor.findFirst({
        where: {
          id: dto.id,
        },
        include: {
          object: true,
          additional_sensor_info: true,
          sensor_operation_log: true,
          files: true,
          requestSensorInfo: true,
          error_information: true,
        },
      });
      return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', oneSensor: oneSensor };
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }

  async getAllTypeOfSensors(dto: { email: string }) {
    console.log('dto -', dto);
    // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (checkAccess) {
      return await this.getAllTypeSensorsFromDb();
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }

  async saveFileAboutSensor(file: any, dto: any): Promise<any> {
    let filePath: string;
    try {
      // Папка для загрузки файлов
      const uploadsFolder = './uploads';

      // Полный путь к загруженному файлу
      filePath = path.join(uploadsFolder, file.originalname);

      // Проверяем, существует ли папка uploads, и если нет, создаем ее
      if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder, { recursive: true });
      }

      // Записываем файл в папку uploads
      fs.writeFileSync(filePath, file.buffer);

      // Создаем URL для доступа к файлу
      const fileUrl = `http://localhost:5000/uploads/${file.originalname}`;

      // Сохраняем запись в базе данных
      const createFileResult = await this.dbService.sensorFile.create({
        data: {
          url: fileUrl,
          sensor_id: dto,
        },
      });
      if (createFileResult) {
        return await this.sendUpdatedDataOneSensor(createFileResult.sensor_id);
      } else {
        fs.unlinkSync(filePath);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при записи файла',
        };
      }
      // Возвращаем URL для доступа к файлу
      return { fileUrl };
    } catch (error) {
      console.error('Произошла ошибка при сохранении файла:', error);

      // Удаление файла, если он был создан, но запись в базу данных не удалась
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      // Возбуждаем ошибку, чтобы уведомить об ошибке вызывающий код
      throw error;
    }
  }

  async changeDesignationOneSensorFrom(dto: any) {
    console.log('dto -', dto);
    try {
      // Проверяем наличие датчика в базе данных
      const sensor = await this.dbService.new_Sensor.findFirst({
        where: { id: dto.id },
      });

      if (!sensor) {
        const errorMessage = `Датчик с идентификатором ${dto.id} не найден`;
        console.log(errorMessage);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessage,
        };
      }
      const updatedSensor = await this.dbService.new_Sensor.update({
        where: { id: dto.id },
        data: { designation: dto.designation },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Успешное выполнение операции',
        oneSensor: updatedSensor,
      };
    } catch (error) {
      console.error('Ошибка при изменении датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении датчика',
      };
    }
  }

  async changeValueOneSensor(dto: any) {
    console.log('dto -', dto);
    try {
      // Проверяем наличие датчика в базе данных
      const sensor = await this.dbService.requestSensorInfo.findFirst({
        where: { sensor_id: dto.id },
      });

      if (!sensor) {
        const errorMessage = `Датчик с идентификатором ${dto.id} не найден`;
        console.log(errorMessage);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessage,
        };
      }

      // Обновляем значение поля min или max на основе флага
      const fieldToUpdate = dto.flag === 'min' ? 'min_base' : dto.flag === 'max' ? 'max_base' : null;

      if (!fieldToUpdate) {
        const errorMessage = `Недопустимый флаг: ${dto.flag}`;
        console.log(errorMessage);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessage,
        };
      }

      const updatedSensor = await this.dbService.requestSensorInfo.update({
        where: { id: sensor.id },
        data: { [fieldToUpdate]: dto.value },
      });

      // Получаем обновленный датчик с вложенными данными
      const oneSensor = await this.dbService.new_Sensor.findFirst({
        where: { id: dto.id },
        include: {
          object: true,
          additional_sensor_info: true,
          sensor_operation_log: true,
          files: true,
          requestSensorInfo: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Успешное выполнение операции',
        oneSensor,
      };
    } catch (error) {
      console.error('Ошибка при изменении датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении датчика',
      };
    }
  }


  async changeDataForEmissionProcessing(dto: SensorEmissionDto) {
    console.log('dto -', dto);
    try {
      const findSensors = await this.dbService.new_Sensor.findMany({
        where: {
          object_id: dto.object_id,
          model: dto.model,
        },
        include: {
          additional_sensor_info: true, // Include related model organization
        },
      });

      console.log(findSensors);

      if (findSensors.length > 0) {
        for (const sensor of findSensors) {
          const findSensor = await this.dbService.additionalSensorInfo.findFirst({
            where: {
              sensor_id: sensor.id,
            },
          });

          if (findSensor) {
            try {
              await this.dbService.additionalSensorInfo.updateMany({
                where: {
                  sensor_id: sensor.id,
                },
                data: {
                  limitValue: dto.limitValue,
                  emissionsQuantity: dto.emissionsQuantity,
                  errorsQuantity: dto.errorsQuantity,
                  missedConsecutive: dto.missedConsecutive,
                  maxQuantity: dto.maxQuantity,
                  minQuantity: dto.minQuantity
                },
              });
            } catch (updateError) {
              console.error(`Error updating sensor ${sensor.id}:`, updateError);
              return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Error updating sensor ${sensor.id}`,
              };
            }
          } else {
            try {
              await this.dbService.additionalSensorInfo.create({
                data: {
                  sensor_id: sensor.id,
                  limitValue: dto.limitValue,
                  emissionsQuantity: dto.emissionsQuantity,
                  errorsQuantity: dto.errorsQuantity,
                  missedConsecutive: dto.missedConsecutive,
                  maxQuantity: dto.maxQuantity,
                  minQuantity: dto.minQuantity
                },
              });
            } catch (createError) {
              console.error(`Error creating additional info for sensor ${sensor.id}:`, createError);
              return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Error creating additional info for sensor ${sensor.id}`,
              };
            }
          }
        }
      } else {
        const errorMessage = `Object with id ${dto.object_id} not found`;
        console.log(errorMessage);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessage,
        };
      }

      const allSensors = await this.dbService.new_Sensor.findMany({
        include: {
          object: true,
          additional_sensor_info: true, // Include related model organization
          sensor_operation_log: true, // Include related sensors
          files: true,
          requestSensorInfo: true,
          error_information: true
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Успешное выполнение операции',
        allSensors: allSensors,
      };
    } catch (error) {
      console.error('Error while modifying sensor:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: '500 Error while modifying sensor',
      };
    }
  }

  async changeParametersForOneObject(dto: any) {
    console.log('dto -', dto);
    try {
      const findObject = await this.dbService.m_Object.findFirst({
        where: {
          id: dto.id,
        },
        include: {
          Sensor: {
            include: {
              requestSensorInfo: true,
            },
          },
        },
      });

      if (findObject) {
        const allSensors = findObject.Sensor;
        // console.log(allSensors)
        if (dto.flag === 'null') {
          if (findObject?.set_null) {
            for (const sensor of allSensors) {
              const sensorId = sensor.id;
              await this.dbService.requestSensorInfo.updateMany({
                where: {
                  sensor_id: sensorId,
                },
                data: {
                  base_zero: 0,
                },
              });
            }
            await this.dbService.m_Object.update({
              where: {
                id: dto.id,
              },
              data: {
                set_null: false,
              },
            });
          } else {
            for (const sensor of allSensors) {
              const sensorId = sensor.id;
              await this.dbService.requestSensorInfo.updateMany({
                where: {
                  sensor_id: sensorId,
                },
                data: {
                  base_zero: sensor.requestSensorInfo[0].last_base_value,
                },
              });
            }
            await this.dbService.m_Object.update({
              where: {
                id: dto.id,
              },
              data: {
                set_null: true,
              },
            });
          }
        } else {
          for (const sensor of allSensors) {
            const sensorId = sensor.id;
            await this.dbService.requestSensorInfo.updateMany({
              where: {
                sensor_id: sensorId,
              },
              data: {
                periodicity: dto.periodicity,
              },
            });
          }
        }

        return {
          statusCode: HttpStatus.OK,
          message: 'Успешное выполнение операции',
          allSensors: await this.dbService.new_Sensor.findMany({
            include: {
              object: true,
              additional_sensor_info: true, // Включаем связанную модель организации
              sensor_operation_log: true, // Включаем связанные сенсоры
              files: true,
              requestSensorInfo: true,
              error_information: true
            },
          }),
        };
      } else {
        return { statusCode: HttpStatus.BAD_REQUEST, message: 'Объект не найден' };
      }
    } catch (error) {
      console.error('Ошибка при изменении датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении датчика',
      };
    }
  }

  async setNullForOneSensor(dto: any) {
    console.log('dto -', dto);
    try {
      const sensor = await this.dbService.requestSensorInfo.findFirst({
        where: {
          sensor_id: dto.id,
        },
      });
      let updatedSensor;
      if (dto.flag === 'set') {
        updatedSensor = await this.dbService.requestSensorInfo.update({
          where: {
            id: sensor.id,
          },
          data: {
            base_zero: sensor.last_base_value,
          },
        });
      } else {
        updatedSensor = await this.dbService.requestSensorInfo.update({
          where: {
            id: sensor.id,
          },
          data: {
            base_zero: 0,
          },
        });
      }

      if (updatedSensor) {
        return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', oneSensor: updatedSensor };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при обнулении датчика',
        };
      }
    } catch (error) {
      console.error('Ошибка при изменении датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении датчика',
      };
    }
  }

  async changeStatusOneSensor(dto: any) {
    console.log('dto -', dto);
    try {
      const sensor = await this.dbService.new_Sensor.findUnique({
        where: {
          id: dto.id,
        },
      });
      if (!sensor) {
        console.log(`Датчик с идентификатором ${dto.id} не найден`);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Датчик с идентификатором ${dto.id} не найден`,
        };
      }
      const updatedSensor = await this.dbService.new_Sensor.update({
        where: {
          id: dto.id,
        },
        data: {
          run: !sensor.run,
        },
      });
      if (updatedSensor) {
        return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', oneSensor: updatedSensor };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при изменении датчика',
        };
      }
    } catch (error) {
      console.error('Ошибка при изменении датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении датчика',
      };
    }
  }

  async changeWarningOneSensor(dto: any) {
    console.log('dto -', dto);
    try {
      const sensor = await this.dbService.requestSensorInfo.findFirst({
        where: {
          sensor_id: dto.sensor_id,
        },
      });
      if (!sensor) {
        console.log(`Датчик с идентификатором ${dto.sensor_id} не найден`);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Датчик с идентификатором ${dto.sensor_id} не найден`,
        };
      }

      const updatedSensor = await this.dbService.requestSensorInfo.update({
        where: {
          id: sensor.id,
        },
        data: {
          warning: !sensor.warning,
        },
      });
      if (updatedSensor) {
        const oneSensor = await this.dbService.new_Sensor.findFirst({
          where: {
            id: dto.sensor_id,
          },
          include: {
            object: true,
            additional_sensor_info: true,
            sensor_operation_log: true,
            files: true,
            requestSensorInfo: true,
          },
        });
        return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', oneSensor: oneSensor };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при изменении статуса  датчика',
        };
      }
    } catch (error) {
      console.error('Ошибка при изменении статуса датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении статуса датчика',
      };
    }
  }

  async changeTimeRequestSensors(dto: any) {
    console.log('dto -', dto);
    try {
      const setTimeRequestForAllSensors = await this.dbService.requestSensorInfo.updateMany({
        data: {
          periodicity: dto.periodicity, // New periodicity value
        },
      });
      if (setTimeRequestForAllSensors) {
        return { statusCode: HttpStatus.OK, message: 'Время запроса успешно изменено' };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка при изменении времени запроса датчиков',
        };
      }
    } catch (error) {
      console.error('Ошибка при изменении времени запроса датчиков', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка при изменении времени запроса датчиков',
      };
    }
  }

  async deleteOneSensorFromApi(dto: any) {
    console.log('dto -', dto);
    try {
      // Массивы с именами связанных таблиц и их полями для удаления
      const relatedTables = [
        { table: 'additionalSensorInfo', field: 'sensor_id' },
        { table: 'sensorOperationLog', field: 'sensor_id' },
        { table: 'sensorFile', field: 'sensor_id' },
        { table: 'requestSensorInfo', field: 'sensor_id' },
        { table: 'dataFromSensor', field: 'sensor_id' }, // Добавляем таблицу dataFromSensor
      ];

      // Цикл для удаления связанных записей из каждой таблицы, если они существуют
      for (const { table, field } of relatedTables) {
        if (dto.id) { // Проверяем наличие id в DTO
          const relatedRecords = await this.dbService[table].findMany({
            where: { [field]: dto.id },
          });

          if (relatedRecords.length > 0) {
            await this.dbService[table].deleteMany({
              where: { [field]: dto.id },
            });
          }
        }
      }

      // Удаление датчика по его ID, если id существует в DTO
      if (dto.id) {
        await this.dbService.new_Sensor.delete({
          where: { id: dto.id },
        });
      }

      // Получение всех оставшихся датчиков
      const allSensors = await this.dbService.new_Sensor.findMany({
        include: {
          object: true,
          additional_sensor_info: true,
          sensor_operation_log: true,
          files: true,
          requestSensorInfo: true,
        },
      });

      return { statusCode: HttpStatus.OK, message: 'Датчик успешно удален из базы данных', allSensors: allSensors };
    } catch (error) {
      console.error('Ошибка при удалении датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при удалении датчика из базы данных',
      };
    }
  }

  async importNewSensorsToObject(dto: any) {
    console.log('dto -', dto);
    this.saveSensorsData(dto.object_id, dto.sensorsData)
      .then(() => {
        console.log('Данные успешно записаны в базу данных');
      })
      .catch(error => {
        console.error('Произошла ошибка при записи данных:', error);
      });
  }

  async changeNetNumberForSensor(dto: any) {
    console.log('dto -', dto);
    // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
    try {
      const updatedSensor = await this.dbService.new_Sensor.update({
        where: { id: dto.id },
        data: { network_number: Number(dto.network_number) },
      });
      if (updatedSensor) {
        return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', oneSensor: updatedSensor };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка при записи сетевого номера  датчика',
        };
      }
    } catch (error) {
      console.error('Ошибка при записи сетевого номера датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи сетевого номера датчика',
      };
    }
  }

  async changeIPForSensor(dto: any) {
    console.log('dto -', dto);
    // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
    try {
      const updatedSensor = await this.dbService.new_Sensor.update({
        where: { id: dto.id },
        data: { ip_address: dto.ip },
      });
      if (updatedSensor) {
        return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', oneSensor: updatedSensor };
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка при записи IP address датчика',
        };
      }
    } catch (error) {
      console.error('Ошибка при записи IP address датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи IP address датчика',
      };
    }
  }

  async createNewTypeSensor(dto: any) {
    console.log('dto -', dto);
    // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (checkAccess) {
      try {
        const existingSensor = await this.dbService.type_Sensor.findUnique({
          where: { sensor_key: dto.sensorsData.sensor_key },
        });
        if (existingSensor) {
          // Датчик уже существует
          if (!existingSensor.models.includes(dto.sensorsData.model)) {
            // Модель еще не добавлена, добавляем ее
            await this.dbService.type_Sensor.update({
              where: { sensor_key: dto.sensorsData.sensor_key },
              data: { models: { push: dto.sensorsData.model } },
            });
          }
          return await this.getAllTypeSensorsFromDb();
        } else {
          await this.dbService.type_Sensor.create({
            data: {
              sensor_key: dto.sensorsData.sensor_key,
              sensor_type: dto.sensorsData.sensor_type,
              models: [dto.sensorsData.model],
            },
          });
          return await this.getAllTypeSensorsFromDb();
        }
      } catch (error) {
        console.error('Ошибка при создании датчика:', error);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при записи данных о датчике',
        };
      }
    } else {
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }
}