import { Injectable } from '@nestjs/common';
import { SocketClientService } from './socketClient.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GetDataSensorService {
  constructor(private readonly socketClientService: SocketClientService,
              private dbService: PrismaService) {
  }

  async sendAndScheduleRequest() {
    const responseDataOfSensors = await this.dbService.new_Sensor.findMany({
      where: {
        run: true, // Параметр для фильтрации
      },
      include: {
        requestSensorInfo: true,
      },
    });
    console.log(responseDataOfSensors);

    // Функция для преобразования строки IP-адреса в отдельные компоненты (IP и порт)
    const parseIpAddress = (sensor) => {
      const [ip, port] = sensor.ip_address.split(':');
      return { ip, port };
    };

    for (let i = 0; i < responseDataOfSensors.length; i++) {
      const { ip, port } = parseIpAddress(responseDataOfSensors[i]);
      const code = responseDataOfSensors[i].requestSensorInfo[0].request_code;
      setTimeout(async () => {
        try {
          const responseData = await this.socketClientService.sendRequest(ip, port, code);
          const allResponseData = {
            sensor_id: responseDataOfSensors[i].id.toString(), // Ensure sensor_id is a string
            request_code: code.toString(), // Ensure request_code is a string
            answer_code: responseData.toString('hex')  // Assuming answer_code is a Buffer
          };
          console.log(allResponseData);
          await this.dbService.dataFromSensor.create({ data: allResponseData });
        } catch (error) {
          console.log(error);
        }
      }, 10000 * i);
    }


    // Вызываем функцию снова после завершения всех запросов
    setTimeout(() => {
      this.sendAndScheduleRequest();
    }, 10000 * responseDataOfSensors.length); // Повторяем вызов через 10 секунд после завершения последнего запроса
  }
}
