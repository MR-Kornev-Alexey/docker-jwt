// sensor.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { dataFromSensor, Prisma } from '@prisma/client'; // Import the Prisma model

interface Period {
  startDate: string;
  endDate: string;
}

interface InputData {
  period: Period;
  sensorIds: string[];
  sensorId: string;
  objectIds: string[];
  objectId: string;
  selectedSensors: string[];
}

@Injectable()
export class SensorsDataService {
  constructor(private dbService: PrismaService) {}

  async getSensorsData(dto: InputData) {
    console.log(dto);
    const { period, sensorIds } = dto;
    const { startDate, endDate } = period;

    // Convert date strings to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
      // Fetch data from Prisma
      const data = await this.dbService.dataFromSensor.findMany({
        where: {
          sensor_id: {
            in: sensorIds,
          },
          created_at: {
            gte: start,
            lte: end,
          },
        },
      });
      // Group data by sensor_id
      const groupedData = data.reduce(
        (acc, item) => {
          if (!acc[item.sensor_id]) {
            acc[item.sensor_id] = [];
          }
          acc[item.sensor_id].push(item);
          return acc;
        },
        {} as Record<string, dataFromSensor[]>,
      );
      return {
        statusCode: HttpStatus.OK,
        groupedData: groupedData,
        message: 'Успешное получение данных',
      };
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при получении данных',
      };
    }
  }

  async getLastValuesDataForDynamicCharts(dto: InputData) {
    console.log(dto);
    const { objectId, sensorIds } = dto;

    try {
      // Массив для хранения данных по всем датчикам
      const groupedData = [];

      // Проходим по каждому выбранному датчику
      for (const sensorId of sensorIds) {
        // Получаем последние 10 записей для текущего датчика
        const dataForSensor = await this.dbService.dataFromSensor.findMany({
          where: {
            sensor_id: sensorId, // Идентификатор датчика
            sensor: {
              object_id: objectId, // Идентификатор объекта
            },
          },
          orderBy: {
            created_at: 'desc', // Сортировка по дате создания в порядке убывания (от новых к старым)
          },
          take: 12, // Ограничение на последние 10 записей
          include: {
            sensor: {
              include: {
                additional_sensor_info: true,
                requestSensorInfo: true,
              },
            },
          },
        });

        // Если для датчика найдены данные, добавляем их в общий массив
        if (dataForSensor.length > 0) {
          groupedData.push({
            sensorId,
            data: dataForSensor,
          });
        }
      }

      // Проверка на наличие данных по всем датчикам
      if (groupedData.length === 0) {
        return {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'Нет данных для выбранных датчиков.',
          groupedData: [],
        };
      }

      // Успешный ответ
      return {
        statusCode: HttpStatus.OK,
        groupedData,
        message: 'Успешное получение данных.',
      };
    } catch (error) {
      // Обработка ошибок базы данных (например, ошибка соединения)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Произошла ошибка базы данных.',
          errorDetails: error.message, // Добавляем информацию об ошибке
        };
      }

      // Обработка других ошибок (например, общая ошибка)
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Произошла непредвиденная ошибка.',
        errorDetails: error.message, // Добавляем информацию об ошибке
      };
    }
  }

  async getLastValuesDataForSelectedObjectsAnsSensors(dto: InputData) {
    console.log(dto);
    try {
      const selectedObject = await this.dbService.m_Object.findMany({
        where: {
          id: dto.objectId,
        },
        include: {
          Sensor: {
            where: {
              id: {
                in: dto.sensorIds,
              },
            },
            include: {
              requestSensorInfo: true,
              additional_sensor_info: true,
            },
          },
        },
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'Успешное выполнение операции',
        selectedObject: selectedObject,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Произошла ошибка при выполнении операции',
        error: error.message,
      };
    }
  }

  async getSelectedSensorsLastData(dto: InputData) {
    console.log(dto);
    try {
      const latestData = await this.dbService.requestSensorInfo.findMany({
        where: {
          sensor_id: {
            in: dto.sensorIds,
          },
        },
      });
      const addData = await this.dbService.additionalSensorInfo.findMany({
        where: {
          sensor_id: {
            in: dto.sensorIds,
          },
        },
      });

      if (latestData) {
        return {
          statusCode: HttpStatus.OK,
          latestData: latestData,
          addData: addData,
          message: 'Успешное получение данных',
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          latestData: [],
          message: 'Данные не найдены',
        };
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка 500 при получении данных',
      };
    }
  }

  async getGroupedDataForSelectedObject(dto: InputData) {
    console.log(dto);
    const { objectId, period, selectedSensors } = dto;
    let { startDate, endDate } = period;

    try {
      // Валидация и исправление входных данных (проверка формата дат и их логики)
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Неверный формат даты. Укажите допустимые даты.',
          groupedData: [],
        };
      }

      // Проверка, что endDate не раньше startDate, если так, меняем их местами
      if (end < start) {
        [startDate, endDate] = [endDate, startDate];
      }

      // Получение данных из базы данных для выбранных датчиков
      const dataFromSensors = await this.dbService.dataFromSensor.findMany({
        where: {
          sensor_id: {
            in: selectedSensors, // Фильтрация по выбранным датчикам
          },
          sensor: {
            object: {
              id: objectId, // Идентификатор объекта
            },
          },
          created_at: {
            gte: new Date(startDate), // Дата начала периода
            lte: new Date(endDate), // Дата конца периода
          },
        },
        include: {
          sensor: {
            include: {
              additional_sensor_info: true,
              requestSensorInfo: true,
            },
          },
        },
      });

      // Проверка на наличие данных
      if (dataFromSensors.length === 0) {
        return {
          statusCode: HttpStatus.NO_CONTENT,
          message: 'Данные за выбранный период и/или датчики не найдены.',
          groupedData: [],
        };
      }

      // Успешный ответ
      return {
        statusCode: HttpStatus.OK,
        groupedData: dataFromSensors,
        message: 'Успешное получение данных.',
      };
    } catch (error) {
      // Обработка ошибок базы данных (например, ошибка соединения)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Произошла ошибка базы данных.',
          errorDetails: error.message, // Добавляем информацию об ошибке
        };
      }

      // Обработка других ошибок (например, общая ошибка)
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Произошла непредвиденная ошибка.',
        errorDetails: error.message, // Добавляем информацию об ошибке
      };
    }
  }

  async getForLineOneSensorsLastData(dto: InputData) {
    console.log(dto);
    const { sensorId, period } = dto;
    const { startDate, endDate } = period;

    try {
      // Ensure startDate and endDate are valid Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate the dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date format');
      }
      // Perform the database query with proper filtering
      const oneData = await this.dbService.dataFromSensor.findFirst({
        where: {
          sensor_id: sensorId,
          created_at: {
            gte: start,
            lte: end,
          },
        },
      });
      console.log(oneData);
      // Check if data was found and return appropriate response
      if (oneData) {
        // Assuming addInfoData is defined somewhere in your service
        const addInfoData = await this.getAddInfoData(sensorId); // Example function to fetch additional info
        return {
          statusCode: HttpStatus.OK,
          oneData: oneData,
          addInfoData: addInfoData,
          message: 'Успешное получение данных',
        };
      } else {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          oneData: null, // Returning null instead of an empty array for consistency
          message: 'Данные не найдены',
        };
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        oneData: null,
        message: 'Ошибка при получении данных',
      };
    }
  }

  // Example function to get additional information
  async getAddInfoData(sensorId: string) {
    // Implement the logic to fetch additional info based on sensorId
    // For demonstration purposes, returning a static object
    return {
      limitValue: 100, // Example value
    };
  }

  async getOneSensorsLastData(dto: InputData) {
    console.log(dto);
    const { sensorId } = dto;
    const oneData = await this.dbService.requestSensorInfo.findMany({
      where: {
        sensor_id: sensorId,
      },
    });
    if (oneData) {
      return {
        statusCode: HttpStatus.OK,
        oneData: oneData,
        message: 'Успешное получение данных',
      };
    } else {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        oneData: [],
        message: 'Данные не найдены',
      };
    }
  }
}
