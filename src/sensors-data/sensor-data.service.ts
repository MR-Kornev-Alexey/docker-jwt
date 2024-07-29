// sensor.service.ts
import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { dataFromSensor } from '@prisma/client'; // Import the Prisma model

interface Period {
  startDate: string;
  endDate: string;
}

interface InputData {
  period: Period;
  sensorIds: string[];
  sensorId: string
}

@Injectable()
export class SensorsDataService {
  constructor(private dbService: PrismaService) {
  }

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
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.sensor_id]) {
          acc[item.sensor_id] = [];
        }
        acc[item.sensor_id].push(item);
        return acc;
      }, {} as Record<string, dataFromSensor[]>);
      return {
        statusCode: HttpStatus.OK,
        groupedData: groupedData,
        message: 'Успешное получение данных',
      };
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при получении данных' };
    }
  }

  async getSelectedSensorsLastData(dto: InputData) {
    console.log(dto);
    console.log('sensorIds --', dto.sensorIds);
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
        return { statusCode: HttpStatus.OK, latestData: latestData, addData: addData, message: 'Успешное получение данных' };
      } else {
        return { statusCode: HttpStatus.NOT_FOUND, latestData: [], message: 'Данные не найдены' };
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при получении данных' };
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
            lte: end
          },
        },
      });
      console.log(oneData)
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
        sensor_id: sensorId
      },
    });
    if (oneData) {
      return { statusCode: HttpStatus.OK, oneData: oneData, message: 'Успешное получение данных' };
    } else {
      return { statusCode: HttpStatus.NOT_FOUND, oneData: [], message: 'Данные не найдены' };
    }
  }
}


