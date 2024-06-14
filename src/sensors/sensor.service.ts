// sensor.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckService } from '../check/check.service';
import { sensorFormInput } from '../types/sensorFormInput';
import * as path from 'path';
import * as fs from 'fs';
import { GetDataSensorService } from '../socketClient/getDataSensor.service';

interface JSONData {
  [key: string]: {
    type: string;
    model: string | string[];
  };
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

  async setLogDataForSensor(dto: { email: string; jsonData: any }) {
    console.log('dto -', dto);
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (checkAccess) {
      try {
        // Создаем новый объект в базе данных
        const createLogDataForSensor = await this.dbService.sensorOperationLog.create({
          data: dto.jsonData,
        });
        if (createLogDataForSensor) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Успешная запись данных',
            oneSensor: createLogDataForSensor,
          };
        } else {
          // Если создание объекта не удалось, выбрасываем ошибку
          throw new Error('Ошибка при записи данных о датчике');
        }

      } catch (error) {
        // Обрабатываем ошибку при создании объекта
        return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при записи данных' };
      }
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }

  async setAdditionalDataForSensor(dto: { email: string; additionalDataForSensor: any }) {
    console.log('dto -', dto);
    // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (checkAccess) {
      try {
        // Создаем новый объект в базе данных
        const createAdditionalDataForSensor = await this.dbService.additionalSensorInfo.create({
          data: dto.additionalDataForSensor,
        });
        if (createAdditionalDataForSensor) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Успешная запись данных',
            oneSensor: createAdditionalDataForSensor,
          };
        } else {
          // Если создание объекта не удалось, выбрасываем ошибку
          throw new Error('Ошибка при записи данных о датчике');
        }

      } catch (error) {
        // Обрабатываем ошибку при создании объекта
        return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при записи данных' };
      }
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
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
      },
    });
    return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', allSensors: allSensors };
  }

  async getAllTypeSensorsFromDb() {
    const allSensors = await this.dbService.type_Sensor.findMany();
    return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', allSensors: allSensors };
  }

  async createNewSensorToObject(dto: sensorFormInput) {
    console.log('dto -- createNewSensorToObject', dto);

    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (!checkAccess) {
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }

    const requestDataToDB = dto.requestData;

    try {
      // Создаем новый объект в базе данных
      const createSensor = await this.dbService.new_Sensor.create({
        data: dto.sensorsData,
      });

      if (!createSensor) {
        throw new Error('Ошибка при записи данных о датчике');
      }

      console.log('createSensor -- ', createSensor);

      requestDataToDB.sensor_id = createSensor.id;
      console.log('requestDataToDB -- ', requestDataToDB);

      const createDataRequest = await this.dbService.requestSensorInfo.create({
        data: requestDataToDB,
      });

      if (!createDataRequest) {
        throw new Error('Ошибка при записи данных запроса о датчике');
      }

      return await this.getAllSensorsFromDb();
    } catch (error) {
      console.error('Ошибка при создании объекта:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи данных о датчике',
      };
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
        return {
          statusCode: HttpStatus.OK,
          message: 'Успешное выполнение операции',
          oneSensor: createFileResult,
        };
      } else {
        fs.unlinkSync(filePath);
        throw new Error('Ошибка при записи данных о датчике');
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

  async changeNullForAllCharts(dto: any) {
    console.log('dto -', dto);
    try {
      const allSensorsInfo = await this.dbService.requestSensorInfo.findMany();
      if(!dto.flag) {
        for (const sensorInfo of allSensorsInfo) {
          const { id, base_zero, last_base_value } = sensorInfo;

          // Обновляем запись с новыми значениями
          await this.dbService.requestSensorInfo.update({
            where: { id },
            data: {
              base_zero: last_base_value
            },
          });
        }
      } else {
        for (const sensorInfo of allSensorsInfo) {
          const { id, base_zero, last_base_value } = sensorInfo;
          // Обновляем запись с новыми значениями
          await this.dbService.requestSensorInfo.update({
            where: { id },
            data: {
              last_base_value: base_zero,
              base_zero: 0,
            },
          });
        }
      }
      return await this.getAllSensorsFromDb()
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
      // Обновляем значение поля run на противоположное
      const updatedSensor = await this.dbService.new_Sensor.update({
        where: {
          id: dto.id,
        },
        data: {
          run: !sensor.run,
        },
      });
      if (updatedSensor) {
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
          },
        });
        return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', oneSensor: oneSensor };
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
      // Проверяем наличие связанных записей в таблице additional_sensor_info
      const relatedAdditionalSensorInfo = await this.dbService.additionalSensorInfo.findMany({
        where: { sensor_id: dto.id },
      });

      // Удаляем связанные записи из таблицы additional_sensor_info
      if (relatedAdditionalSensorInfo.length > 0) {
        await this.dbService.additionalSensorInfo.deleteMany({
          where: { sensor_id: dto.id },
        });
      }
      const relatedSensorOperationLogs = await this.dbService.sensorOperationLog.findMany({
        where: { sensor_id: dto.id },
      });

      // Удаляем связанные записи из таблицы sensor_operation_log
      if (relatedSensorOperationLogs.length > 0) {
        await this.dbService.sensorOperationLog.deleteMany({
          where: { sensor_id: dto.id },
        });
      }
      const relatedSensorFiles = await this.dbService.sensorFile.findMany({
        where: { sensor_id: dto.id },
      });

      // Удаляем связанные записи из таблицы SensorFile
      if (relatedSensorFiles.length > 0) {
        await this.dbService.sensorFile.deleteMany({
          where: { sensor_id: dto.id },
        });
      }
      const requestDataSensor = await this.dbService.requestSensorInfo.findMany({
        where: { sensor_id: dto.id },
      });
      if (requestDataSensor.length > 0) {
        await this.dbService.requestSensorInfo.deleteMany({
          where: { sensor_id: dto.id },
        });
      }
      // Удаляем датчик по его ID
      await this.dbService.new_Sensor.delete({
        where: { id: dto.id },
      });
      const allSensors = await this.dbService.new_Sensor.findMany({
        include: {
          object: true,
          additional_sensor_info: true, // Включаем связанную модель организации
          sensor_operation_log: true, // Включаем связанные сенсоры
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
        const allSensors = await this.dbService.new_Sensor.findMany({
          include: {
            object: true,
            additional_sensor_info: true, // Включаем связанную модель организации
            sensor_operation_log: true, // Включаем связанные сенсоры
            files: true,
            requestSensorInfo: true,
          },
        });
        return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', allSensors: allSensors };
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
        const allSensors = await this.dbService.new_Sensor.findMany({
          include: {
            object: true,
            additional_sensor_info: true, // Включаем связанную модель организации
            sensor_operation_log: true, // Включаем связанные сенсоры
            files: true,
            requestSensorInfo: true,
          },
        });
        return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', allSensors: allSensors };
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