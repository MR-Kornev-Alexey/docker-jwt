import cron from 'node-cron';
import { Injectable } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SseService } from '../sse/sse.service';
import { CalculateService } from '../calculate/calculate.service';

@Injectable()
export class GetDataSensorService {
  private isProcessing = false;
  private sensorCache: any[] = [];
  private lastFetchTime: number = 0;
  private cacheDuration: number = 5000; // Cache duration in milliseconds

  constructor(
    private readonly socketClientService: SocketClientService,
    private readonly dbService: PrismaService,
    private readonly sseService: SseService,
    private readonly calculateService: CalculateService
  ) {
    this.startSchedule();
  }

  startSchedule() {
    cron.schedule('*/10 * * * * *', async () => {
      if (!this.isProcessing) {
        this.isProcessing = true;
        try {
          await this.sendAndScheduleRequest();
        } finally {
          this.isProcessing = false;
        }
      } else {
        console.log('Skipping schedule as previous one is still processing');
      }
    });
  }

  async fetchSensors() {
    const now = Date.now();
    if (now - this.lastFetchTime > this.cacheDuration || this.sensorCache.length === 0) {
      this.sensorCache = await this.dbService.new_Sensor.findMany({
        where: {
          run: true, // Параметр для фильтрации
        },
        include: {
          requestSensorInfo: true,
        },
      });
      this.lastFetchTime = now;
    }
    return this.sensorCache;
  }

  async sendAndScheduleRequest() {
    const responseDataOfSensors = await this.fetchSensors();

    // Используем Set для уникальности по идентификатору сенсора
    const sensorMap = new Map();
    for (const sensor of responseDataOfSensors) {
      if (!sensorMap.has(sensor.id)) {
        sensorMap.set(sensor.id, sensor);
      }
    }
    const notDoubleSensorArray = Array.from(sensorMap.values());

    console.log(new Date());
    console.log(notDoubleSensorArray);

    if (notDoubleSensorArray.length > 0) {
      const parseIpAddress = (sensor) => {
        const [ip, port] = sensor.ip_address.split(':');
        return { ip, port: Number(port) }; // Convert port to number
      };

      const processSensor = async (sensor) => {
        if (sensor.ip_address && sensor.requestSensorInfo.length > 0) {
          const { ip, port } = parseIpAddress(sensor);
          const code = sensor.requestSensorInfo[0].request_code;
          const delay = sensor.requestSensorInfo[0].periodicity;

          try {
            const responseData = await this.sendRequestWithTimeout(ip, port, code, delay);
            const allResponseData = {
              sensor_id: sensor.id.toString(), // Ensure sensor_id is a string
              request_code: code.toString(), // Ensure request_code is a string
              answer_code: responseData, // Already in 'hex' format
              created_at: new Date(), // Add the current date and time
            };
            await this.dbService.dataFromSensor.create({ data: allResponseData });
            await this.calculateService.convertDataForCreate(allResponseData, sensor.model);
            await this.sseService.send(allResponseData);
          } catch (error) {
            console.log(error);
          }
        } else {
          console.log(`Skipping sensor with id ${sensor.id} due to missing ip_address or requestSensorInfo`);
        }
      };

      for (let i = 0; i < notDoubleSensorArray.length; i++) {
        await processSensor(notDoubleSensorArray[i]);
        await this.sleep(notDoubleSensorArray[i].requestSensorInfo[0].periodicity);
      }
    }
  }

  private async sendRequestWithTimeout(ip: string, port: number, code: string, timeout: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timed out'));
      }, timeout * 2);

      this.socketClientService.sendRequest(ip, port, code)
        .then(responseData => {
          clearTimeout(timer);
          resolve(responseData.toString('hex'));
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
