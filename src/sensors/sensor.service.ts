// sensor.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckService } from '../check/check.service';
import { sensorFormInput } from '../types/sensorFormInput';
import * as path from 'path';
import * as fs from 'fs';
import { GetDataSensorService } from '../socketClient/getDataSensor.service';
import { CalculateService } from '../calculate/calculate.service';

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
  maxQuantity: number;
  minQuantity: number;
}

// Интерфейсы для связанных данных
interface Object {
  // Свойства объекта
  id: number;
  name: string;
  // Добавьте дополнительные свойства, если необходимо
}

interface AdditionalSensorInfo {
  // Свойства дополнительной информации о сенсоре
  id: number;
  detail: string;
  // Добавьте дополнительные свойства, если необходимо
}

interface SensorOperationLog {
  // Свойства логов операций сенсора
  id: number;
  operation: string;
  timestamp: Date;
  // Добавьте дополнительные свойства, если необходимо
}

interface File {
  // Свойства файлов
  id: number;
  filename: string;
  path: string;
  // Добавьте дополнительные свойства, если необходимо
}

interface RequestSensorInfo {
  // Свойства запроса информации о сенсоре
  id: number;
  requestType: string;
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
}

interface ErrorInformation {
  // Свойства информации об ошибках
  id: number;
  errorCode: string;
  errorMessage: string;
  // Добавьте дополнительные свойства, если необходимо
}

// Основной интерфейс для сенсора
interface Sensor {
  id: number;
  sensor_type: string;
  object: Object;
  additional_sensor_info: AdditionalSensorInfo;
  sensor_operation_log: SensorOperationLog[];
  files: File[];
  requestSensorInfo: RequestSensorInfo;
  error_information: ErrorInformation;
}

// Типизация возвращаемого значения функции
interface GetAllSensorsResponse {
  statusCode: number;
  message: string;
  allSensors: Sensor[];
}

interface SetAdditionalParameterDto {
  email: string;
  sensor_id: string;
  parameter: keyof SensorModel; // Assuming SensorModel is the type of your sensor
  value: any; // Adjust this to match the type of the value for the parameter
}

interface limitValuesDataSensor {
  object_id: string;
  model: string;
  limitValue: number;
  emissionsQuantity: number;
  errorsQuantity: number;
  missedConsecutive: number;
  maxQuantity: number;
  minQuantity: number;
}

interface inputLimitsValue {
  limitValuesDataSensor: limitValuesDataSensor;
  email: string;
}

interface inputData {
  id: string;
  designation: string;
  email: string;
}

// Adjust SensorModel to match the shape of your sensor model
type SensorModel = {
  id: string;
  object: any; // Replace with actual type
  sensor_type: string;
  sensor_key: string;
  model: string;
  ip_address?: string;
  designation?: string;
  network_number: number;
  notation?: string;
  run: boolean;
  error_information: any[];
  additional_sensor_info: any[];
  sensor_operation_log: any[];
  files: any[];
  dataFromSensor: any[];
  requestSensorInfo: any[];
};

@Injectable()
export class SensorService {
  constructor(
    private dbService: PrismaService,
    private checkService: CheckService,
    private getDataSensorService: GetDataSensorService,
    private calculateService: CalculateService,
  ) {}

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

  async setRequestDataForOneSensor(dto: {
    email: string;
    requestDataForSensor: any;
  }) {
    console.log('dto -', dto);
    try {
      const createRequestDataForSensor =
        await this.dbService.requestSensorInfo.create({
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
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи данных',
      };
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
        return await this.getAllSensorsFromDb();
      } else {
        return {
          statusCode: HttpStatus.NOT_MODIFIED,
          message: 'Ошибка при записи данных',
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи данных',
      };
    }
  }

  async setAdditionalParameterForSensor(dto: SetAdditionalParameterDto) {
    console.log('dto -', dto);
    try {
      // Find the sensor by ID
      const findSensor = await this.dbService.new_Sensor.findFirst({
        where: {
          id: dto.sensor_id,
        },
      });

      if (findSensor) {
        // Prepare the update data
        const updateData = await this.dbService.new_Sensor.update({
          where: {
            id: findSensor.id,
          },
          data: {
            [dto.parameter]: dto.value, // Dynamically update the field based on `dto.parameter`
          },
        });

        if (updateData) {
          // Return all sensors after update
          return await this.getAllSensorsFromDb();
        } else {
          return {
            statusCode: HttpStatus.NOT_MODIFIED,
            message: 'Ошибка при записи данных',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Данные датчика не найдены',
        };
      }
    } catch (error) {
      console.error('Error updating sensor parameter:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи данных',
      };
    }
  }

  async setAdditionalDataForSensor(dto: {
    email: string;
    additionalSensorsData: any;
  }) {
    console.log('dto -', dto);
    try {
      const findSensor = await this.dbService.additionalSensorInfo.findFirst({
        where: {
          sensor_id: dto.additionalSensorsData.sensor_id,
        },
      });
      dto.additionalSensorsData.coefficient =
        await this.calculateService.convertStringToNumber(
          dto.additionalSensorsData.coefficient,
        );
      console.log('dto -', dto);
      let additionalDataForSensor;

      if (findSensor) {
        additionalDataForSensor =
          await this.dbService.additionalSensorInfo.update({
            where: {
              id: findSensor.id,
            },
            data: dto.additionalSensorsData,
          });
      } else {
        additionalDataForSensor =
          await this.dbService.additionalSensorInfo.create({
            data: dto.additionalSensorsData,
          });
      }
      if (additionalDataForSensor) {
        return await this.getAllSensorsFromDb();
      } else {
        return {
          statusCode: HttpStatus.NOT_MODIFIED,
          message: 'Ошибка при записи данных',
        };
      }
    } catch (error) {
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
              models: Array.isArray(sensorData.model)
                ? sensorData.model
                : [sensorData.model],
            },
          });
        }
        return await this.getAllTypeSensorsFromDb();
      } catch (error) {
        // Обрабатываем ошибку при создании объекта
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при записи данных',
        };
      }
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }

  async getAllSensorsWithNotStatus() {
    return this.dbService.new_Sensor.findMany({
      include: {
        object: true,
        additional_sensor_info: true, // Включаем связанную модель организации
        sensor_operation_log: true, // Включаем связанные сенсоры
        files: true,
        requestSensorInfo: true,
        error_information: true,
      },
      orderBy: [
        {
          sensor_type: 'asc', // Сначала сортируем по sensor_type
        },
        {
          network_number: 'asc', // Затем сортируем по network_number внутри каждого sensor_type
        },
      ],
    });
  }

  // Использование Prisma типов
  async getAllSensorsFromDb(): Promise<any> {
    const allSensors = await this.dbService.new_Sensor.findMany({
      include: {
        object: true,
        additional_sensor_info: true, // Включаем связанную модель организации
        sensor_operation_log: true, // Включаем связанные сенсоры
        files: true,
        requestSensorInfo: true,
        error_information: true,
      },
      orderBy: [
        {
          sensor_type: 'asc', // Сначала сортируем по sensor_type
        },
        {
          network_number: 'asc', // Затем сортируем по network_number внутри каждого sensor_type
        },
      ],
    });
    return {
      statusCode: 200,
      message: 'Успешное выполнение операции',
      allSensors: allSensors,
    };
  }

  async getAllTypeSensorsFromDb() {
    const allSensorsType = await this.dbService.type_Sensor.findMany();
    return {
      statusCode: HttpStatus.OK,
      message: 'Успешное выполнение операции',
      allSensorsType: allSensorsType,
    };
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
      sensorData.network_number = Number(sensorData.network_number);
      const createSensor = await this.dbService.new_Sensor.create({
        data: sensorData,
      });
      if (!createSensor) {
        throw new Error('Error creating sensor record');
      }
      requestData.sensor_id = createSensor.id;
      const createDataRequest = await this.dbService.requestSensorInfo.create({
        data: requestData,
      });
      const addInfoSensor = {
        sensor_id: createSensor.id,
        coefficient: 1,
      };
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
    const checkAccess = await this.checkService.checkAllUserAccess(dto.email);
    if (checkAccess) {
      return await this.getAllSensorsFromDb();
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }

  async getAllDataAboutOneSensor(dto: { email: string; id: string }) {
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
      return {
        statusCode: HttpStatus.OK,
        message: 'Успешное выполнение операции',
        oneSensor: oneSensor,
      };
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
    const uploadsFolder = './uploads';
    try {
      // Full path to the uploaded file
      filePath = path.join(uploadsFolder, path.basename(file.originalname));

      console.log('Saving file to:', filePath); // Log the file path

      // Ensure the uploads folder exists
      if (!fs.existsSync(uploadsFolder)) {
        fs.mkdirSync(uploadsFolder, { recursive: true });
      }

      // Write the file to the uploads folder
      fs.writeFileSync(filePath, file.buffer);

      // Create the file URL dynamically based on environment
      const fileUrl = `${process.env.BASE_URL}/uploads/${path.basename(file.originalname)}`;

      console.log('Generated file URL:', fileUrl); // Log the file URL

      // Save the file record in the database
      const createFileResult = await this.dbService.sensorFile.create({
        data: {
          url: fileUrl,
          sensor_id: dto,
        },
      });

      if (createFileResult) {
        return await this.getAllSensorsFromDb();
      } else {
        // Remove the file if database saving fails
        fs.unlinkSync(filePath);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при записи файла',
        };
      }
    } catch (error) {
      console.error('Произошла ошибка при сохранении файла:', error);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  async changeDesignationOneSensorFromApi(dto: inputData) {
    console.log(dto);
    try {
      const foundSensor = await this.dbService.new_Sensor.findFirst({
        where: {
          id: dto.id,
        },
      });
      if (foundSensor) {
        const updateSensor = await this.dbService.new_Sensor.update({
          where: {
            id: dto.id,
          },
          data: {
            designation: dto.designation,
          },
        });
        if (updateSensor) {
          return this.getAllSensorsFromDb();
        } else {
          return {
            statusCode: HttpStatus.NOT_MODIFIED,
            message: `Ошибка изменения данных `,
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Сенсор не найден`,
        };
      }
    } catch (error) {
      console.error('Ошибка:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении датчика',
      };
    }
  }

  async changeLimitValuesOneSensor(dto: inputLimitsValue) {
    const {
      model,
      limitValue,
      emissionsQuantity,
      errorsQuantity,
      missedConsecutive,
      maxQuantity,
      minQuantity,
    } = dto.limitValuesDataSensor;

    try {
      // Поиск сенсоров с заданной моделью и object_id
      const matchingSensors = await this.dbService.new_Sensor.findMany({
        where: {
          object_id: dto.limitValuesDataSensor.object_id,
          model: model,
        },
      });

      if (matchingSensors.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Сенсоры с моделью ${model} не найдены`,
        };
      }

      // Поиск записей в additionalSensorInfo, связанных с найденными сенсорами
      const additionalSensorInfos =
        await this.dbService.additionalSensorInfo.findMany({
          where: {
            sensor_id: {
              in: matchingSensors.map((sensor) => sensor.id), // Используем массив id найденных сенсоров
            },
          },
        });

      if (additionalSensorInfos.length === 0) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Соответствующие записи в additionalSensorInfo не найдены',
        };
      }

      const updatePromises = additionalSensorInfos.map((info) => {
        return this.dbService.additionalSensorInfo.update({
          where: { id: info.id }, // Здесь используется уникальный идентификатор записи
          data: {
            limitValue: limitValue,
            emissionsQuantity: emissionsQuantity,
            errorsQuantity: errorsQuantity,
            minQuantity: minQuantity,
            maxQuantity: maxQuantity,
            missedConsecutive: missedConsecutive,
          },
        });
      });

      // Ожидаем выполнения всех обновлений
      await Promise.all(updatePromises);

      // Возвращаем обновленный список датчиков
      return this.getAllSensorsFromDb();
    } catch (error) {
      console.error('Ошибка:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении датчика',
      };
    }
  }

  async changeDataForEmissionProcessing(dto: SensorEmissionDto) {
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

      if (findSensors.length > 0) {
        for (const sensor of findSensors) {
          const findSensor =
            await this.dbService.additionalSensorInfo.findFirst({
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
                  minQuantity: dto.minQuantity,
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
                  minQuantity: dto.minQuantity,
                },
              });
            } catch (createError) {
              console.error(
                `Error creating additional info for sensor ${sensor.id}:`,
                createError,
              );
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
          error_information: true,
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
              error_information: true,
            },
          }),
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Объект не найден',
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

  async setNullForAllSensorOnObject(dto: any) {
    console.log('dto -', dto);

    try {
      // Fetch the object and related sensors in a single query
      const foundObject = await this.dbService.m_Object.findFirst({
        where: { id: dto.object_id },
        include: {
          Sensor: {
            include: {
              requestSensorInfo: true,
            },
          },
        },
      });

      if (!foundObject) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Объект не найден',
        };
      }

      // Проверяем, есть ли у всех сенсоров данные о `last_base_value`
      const hasMissingData = foundObject.Sensor.some((sensor) => {
        const requestSensorInfo = sensor.requestSensorInfo[0];
        return !requestSensorInfo?.last_base_value;
      });

      if (hasMissingData) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Установка нуля не возможна, так как по некоторым сенсорам на объекте нет полученных данных.',
        };
      }

      // Update the object directly (even if there's no sensor update)
      await this.dbService.m_Object.update({
        where: { id: dto.object_id },
        data: { set_null: dto.set_null },
      });

      // Process sensors only if `last_base_value` is available
      const sensorUpdates = foundObject.Sensor.map((sensor) => {
        const requestSensorInfo = sensor.requestSensorInfo[0];

        let updateData;

        if (dto.set_null) {
          // If set_null is true, swap last_base_value to base_zero and set last_base_value to 0
          updateData = {
            base_zero: requestSensorInfo.last_base_value,
            last_base_value: 0,
          };
          console.log(
            'Ноль выставлен - base_zero получает значение last_base_value, last_base_value становится 0',
          );
        } else {
          // If set_null is false, swap base_zero to last_base_value and set base_zero to 0
          updateData = {
            last_base_value: requestSensorInfo.base_zero,
            base_zero: 0,
          };
          console.log(
            'Ноль сброшен - last_base_value получает значение base_zero, base_zero становится 0',
          );
        }

        return this.dbService.requestSensorInfo.updateMany({
          where: { id: requestSensorInfo.id },
          data: updateData,
        });
      });

      // Perform the updates only for valid sensors
      await Promise.all(sensorUpdates);

      const allObjects = await this.dbService.m_Object.findMany({
        include: {
          organization: true, // Включаем связанную модель организации
          Sensor: {
            include: {
              requestSensorInfo: true,
              additional_sensor_info: true,
            },
          },
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Успешное обновление данных',
        allSensors: await this.getAllSensorsWithNotStatus(),
        allObjects: allObjects,
      };
    } catch (error) {
      console.error('Error updating sensors:', error);
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
        return await this.getAllSensorsFromDb();
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при изменении датчика',
          allSensors: await this.getAllSensorsWithNotStatus(),
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при изменении датчика',
        allSensors: await this.getAllSensorsWithNotStatus(),
      };
    }
  }

  async setRequestParameterForSensor(dto: any) {
    console.log('setRequestParameterForSensor - dto -', dto);
    try {
      const findSensor = await this.dbService.requestSensorInfo.findFirst({
        where: {
          sensor_id: dto.sensor_id,
        },
      });
      console.log(findSensor);
      if (findSensor) {
        const updateSensor = await this.dbService.requestSensorInfo.update({
          where: { id: findSensor.id },
          data: {
            [dto.parameter]: dto.value,
          },
        });
        if (updateSensor) {
          return this.getAllSensorsFromDb();
        } else {
          return {
            statusCode: HttpStatus.NOT_MODIFIED,
            message: 'Ошибка записи данных датчика',
          };
        }
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Датчик не найден',
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
      const setTimeRequestForAllSensors =
        await this.dbService.requestSensorInfo.updateMany({
          data: {
            periodicity: dto.periodicity, // New periodicity value
          },
        });
      if (setTimeRequestForAllSensors) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Время запроса успешно изменено',
        };
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
        { table: 'dataFromSensor', field: 'sensor_id' },
        { table: 'sensorErrorsLog', field: 'sensor_id' }, // Ensure this table is included
      ];

      // Цикл для удаления связанных записей из каждой таблицы, если они существуют
      for (const { table, field } of relatedTables) {
        if (dto.id) {
          // Проверяем наличие id в DTO
          await this.dbService[table].deleteMany({
            where: { [field]: dto.id },
          });
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
          error_information: true,
          dataFromSensor: true,
        },
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Датчик успешно удален из базы данных',
        allSensors: allSensors,
      };
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
      .catch((error) => {
        console.error('Произошла ошибка при записи данных:', error);
      });
  }

  async changeNetNumberForSensor(dto: any) {
    console.log('dto -', dto);
    try {
      const updatedSensor = await this.dbService.new_Sensor.update({
        where: { id: dto.id },
        data: { network_number: Number(dto.network_number) },
      });
      if (updatedSensor) {
        return await this.getAllSensorsFromDb();
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка 500 при изменении данных датчика',
          allSensors: await this.getAllSensorsWithNotStatus(),
        };
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи сетевого номера датчика',
        allSensors: await this.getAllSensorsWithNotStatus(),
      };
    }
  }

  async changeIPForSensor(dto: any) {
    console.log('dto -', dto);

    try {
      const updatedSensor = await this.dbService.new_Sensor.update({
        where: { id: dto.id },
        data: { ip_address: dto.ip },
      });
      if (updatedSensor) {
        return await this.getAllSensorsFromDb();
      } else {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ошибка при записи IP address датчика',
          allSensors: await this.getAllSensorsWithNotStatus(),
        };
      }
    } catch (error) {
      console.error('Ошибка при записи IP address датчика:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при записи IP address датчика',
        allSensors: await this.getAllSensorsWithNotStatus(),
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
