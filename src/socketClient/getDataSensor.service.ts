import { Injectable } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SseService } from '../sse/sse.service';
import { CalculateService } from '../calculate/calculate.service';

@Injectable()
export class GetDataSensorService {
  constructor(
    private readonly socketClientService: SocketClientService,
    private dbService: PrismaService,
    private readonly sseService: SseService,
    private readonly calculateService: CalculateService
) {}
  async startSchedule(){
    const responseDataOfSensors = await this.dbService.new_Sensor.findMany({
      where: {
        run: true, // Параметр для фильтрации
      },
      include: {
        requestSensorInfo: true,
      },
    });
    await this.sendAndScheduleRequest();
    setInterval(() => {
      this.sendAndScheduleRequest();
    }, responseDataOfSensors.length*12000);
  }
  async sendAndScheduleRequest() {
    const responseDataOfSensors = await this.dbService.new_Sensor.findMany({
      where: {
        run: true, // Filtering condition
      },
      include: {
        requestSensorInfo: true,
      },
    });

    // Debugging output to verify the structure of the data
    // console.log(responseDataOfSensors);

    if (responseDataOfSensors.length !== 0) {
      const parseIpAddress = (sensor) => {
        const [ip, port] = sensor.ip_address.split(':');
        return { ip, port };
      };

      for (let i = 0; i < responseDataOfSensors.length; i++) {
        const sensor = responseDataOfSensors[i];
        if (sensor.ip_address && sensor.requestSensorInfo.length > 0) {
          const { ip, port } = parseIpAddress(sensor);
          const code = sensor.requestSensorInfo[0].request_code;
          const delay = sensor.requestSensorInfo[0].periodicity;

          setTimeout(async () => {
            try {
              const responseData = await this.socketClientService.sendRequest(ip, port, code);
              const allResponseData = {
                sensor_id: sensor.id.toString(), // Ensure sensor_id is a string
                request_code: code.toString(), // Ensure request_code is a string
                answer_code: responseData.toString('hex'), // Assuming answer_code is a Buffer
                created_at: new Date(), // Add the current date and time
              };

              await this.dbService.dataFromSensor.create({ data: allResponseData });
              await this.calculateService.convertDataForCreate(allResponseData, sensor.model);
              await this.sseService.send(allResponseData);
            } catch (error) {
              console.log(error);
            }
          }, delay * i);
        } else {
          console.log(`Skipping sensor with id ${sensor.id} due to missing ip_address or requestSensorInfo`);
        }
      }
    }
  }

}
