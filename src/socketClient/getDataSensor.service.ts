import { Injectable } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SseService } from '../sse/sse.service';
import { CalculateService } from '../calculate/calculate.service';
import { SensorUtilsService } from '../utils/sensor-utils.service';

interface AllResponseData {
  sensor_id: string;
  request_code: string;
  answer_code: string;
  created_at: Date;
}

@Injectable()
export class GetDataSensorService {
  private isProcessing = false;

  constructor(
    private readonly socketClientService: SocketClientService,
    private readonly dbService: PrismaService,
    private readonly sseService: SseService,
    private readonly calculateService: CalculateService,
    private readonly sensorUtilsService: SensorUtilsService,
  ) {}

  async sendAndScheduleRequest(callback: () => void) {
    const parseIpAddress = (sensor) => {
      const [ip, port] = sensor.ip_address.split(':');
      return { ip, port: Number(port) }; // Convert port to a number
    };

    const calculateLength = async (model: string, inputCode: string) => {
      switch (model) {
        case 'РФ-251':
          return inputCode.substring(0, 28); // длина 14
        case 'ИН-Д3':
          return inputCode.substring(0, 24); // длина 10
        case 'LS5':
          return inputCode.substring(0, 22); // длина 8
        default:
          return inputCode;
      }
    };

    const responseDataOfSensors = await this.dbService.new_Sensor.findMany({
      where: {
        run: true, // Параметр для фильтрации
      },
      include: {
        requestSensorInfo: true,
      },
    });

    if (responseDataOfSensors.length !== 0) {
      let i = 0;
      do {
        const sensor = responseDataOfSensors[i];
        const { ip, port } = parseIpAddress(sensor);
        const code: string = sensor.requestSensorInfo[0].request_code;
        const delay: number = sensor.requestSensorInfo[0].periodicity;
        const model: string = sensor.model;
        const sensorId = sensor.id;
        try {
          const responseData = await this.sendRequestWithTimeout(
            ip,
            port,
            code,
            sensorId,
            60000,
          ); // Тайм-аут 60 секунд
          if (responseData) {
            const allResponseData: AllResponseData = {
              sensor_id: sensor.id.toString(),
              request_code: code.toString(),
              answer_code: await calculateLength(
                model,
                responseData.toString('hex'),
              ),
              created_at: new Date(),
            };
            // console.log('responseData -- ', allResponseData);
            await this.dbService.dataFromSensor.create({
              data: allResponseData,
            });
            await this.calculateService.convertDataForCreate(
              allResponseData,
              sensor.model,
            );
            this.sseService.send(allResponseData);
          }
        } catch (error) {
          console.error(`Error processing sensor ${sensor.id}:`, error);
          await this.sensorUtilsService.sendMessageAboutSensorAndObject(
            sensorId,
            error.message,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, delay)); // Задержка перед следующим запросом
        i++;
      } while (i < responseDataOfSensors.length);
      // Вызываем callback после завершения цикла
      callback();
    } else {
      // Если нет данных для обработки, сразу вызываем callback
      callback();
    }
  }

  private async sendRequestWithTimeout(
    ip: string,
    port: number,
    code: string,
    sensorId: string,
    timeout: number,
  ): Promise<Buffer | null> {
    try {
      const response = await Promise.race([
        this.socketClientService.sendRequest(ip, port, code),
        new Promise<null>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  'Истекло время ожидания ответа датчика или сбой запроса',
                ),
              ),
            timeout,
          ),
        ),
      ]);
      return response as Buffer;
    } catch (error) {
      console.error('Истекло время ожидания ответа или сбой запроса:', error);
      await this.sensorUtilsService.sendMessageAboutSensorAndObject(
        sensorId,
        error.message,
      );
      const findSensors = await this.dbService.requestSensorInfo.findFirst({
        where: {
          sensor_id: sensorId,
        },
      });
      await this.dbService.requestSensorInfo.update({
        where: {
          id: findSensors.id,
        },
        data: {
          last_base_value: 0,
        },
      });
      return null;
    }
  }
}
