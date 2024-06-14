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
}

@Injectable()
export class SensorsDataService {
  constructor(private dbService: PrismaService) {}

  async getSensorsData(dto: InputData) {
    console.log(dto)
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
            in: sensorIds
          },
          created_at: {
            gte: start,
            lte: end
          }
      }});

      // Group data by sensor_id
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.sensor_id]) {
          acc[item.sensor_id] = [];
        }
        acc[item.sensor_id].push(item);
        return acc;
      }, {} as Record<string, dataFromSensor[]>);
      // console.log(groupedData)
      return { statusCode: HttpStatus.OK, groupedData: groupedData, message: 'Успешное получение данных',};
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при получении данных' };
    }
  }

  async getSensorsDataHour(dto: InputData) {
    console.log(dto)

  }
}
