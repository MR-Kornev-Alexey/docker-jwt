import { Injectable } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SseService } from '../sse/sse.service';
import { CalculateService } from '../calculate/calculate.service';

@Injectable()
export class GetDataSensorService {
  private isProcessing = false;

  constructor(
    private readonly socketClientService: SocketClientService,
    private readonly dbService: PrismaService,
    private readonly sseService: SseService,
    private readonly calculateService: CalculateService,
  ) {}

  async sendAndScheduleRequest(callback: () => void) {
    const parseIpAddress = (sensor) => {
      const [ip, port] = sensor.ip_address.split(':');
      return { ip, port };
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
        const code = sensor.requestSensorInfo[0].request_code;
        const delay = sensor.requestSensorInfo[0].periodicity;

        try {
          const responseData = await this.socketClientService.sendRequest(ip, port, code);
          const allResponseData = {
            sensor_id: sensor.id.toString(),
            request_code: code.toString(),
            answer_code: responseData.toString('hex'),
            created_at: new Date(),
          };

          await this.dbService.dataFromSensor.create({ data: allResponseData });
          await this.calculateService.convertDataForCreate(allResponseData, sensor.model);
          await this.sseService.send(allResponseData);
        } catch (error) {
          console.error(`Error processing sensor ${sensor.id}:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, delay)); // 10 seconds delay
        i++;
      } while (i < responseDataOfSensors.length);

      // Вызываем callback после завершения цикла
      callback();
    } else {
      // Если нет данных для обработки, сразу вызываем callback
      callback();
    }
  }
}
