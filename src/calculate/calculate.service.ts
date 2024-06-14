import { Injectable } from '@nestjs/common';
import parseSensorInD3 from './parse-sensorIn-d3';
import { calculateDistance } from './calculate-distance-d3';
import parseSensorRf251 from './parse-sensor-rf251';
import { PrismaService } from '../prisma/prisma.service';
import { SseService } from '../sse/sse.service';

@Injectable()
export class CalculateService {
  constructor(private dbService: PrismaService, private sseService: SseService) {
  }

  async calculateALLValues(model, code) {
    switch (model) {
      case 'ИН-Д3': {
        const parsedData = parseSensorInD3(code);
        return {
          lastValueX: parsedData.angleX,
          lastValueY: parsedData.angleY,
          lastBaseValue: calculateDistance(parsedData.angleX, parsedData.angleY),
          lastValueZ: 0,
        };
      }
      case 'РФ-251': {
        const parsedData = parseSensorRf251(code);
        return {
          lastValueX: 0,
          lastValueY: parsedData.distance,
          lastBaseValue: parsedData.distance,
          lastValueZ: 0,
        };
      }
      default:
        return {
          lastValueX: null,
          lastValueY: null,
          lastBaseValue: null,
          lastValueZ: null,
        };
    }
  }

  async convertDataForCreate(entry, model: string) {
    const prevDataSensor = await this.dbService.requestSensorInfo.findFirst({
      where: {
        sensor_id: entry.sensor_id,
      },
    });

    const calculateValues = await this.calculateALLValues(model, entry.answer_code);

    if (calculateValues.lastBaseValue === null) {
      await this.handleNullBaseValue(prevDataSensor);
    } else {
      await this.handleValidBaseValue(prevDataSensor, calculateValues);
    }
  }

  private async handleNullBaseValue(prevDataSensor) {
    if (prevDataSensor.alarm_counter < 10) {
      await this.dbService.requestSensorInfo.update({
        where: {
          id: prevDataSensor.id,
        },
        data: {
          alarm_counter: prevDataSensor.alarm_counter + 1,
        },
      });
    } else {
      console.log('Ошибок больше 10');
    }
  }

  private async handleValidBaseValue(prevDataSensor, calculateValues) {
    if (calculateValues.lastBaseValue !== prevDataSensor.last_base_value) {
      if (prevDataSensor.counter < 1) {
        await this.dbService.requestSensorInfo.update({
          where: {
            id: prevDataSensor.id,
          },
          data: {
            counter: prevDataSensor.counter + 1,
          },
        });
      } else {
       const valuesForSend =  await this.dbService.requestSensorInfo.update({
          where: {
            id: prevDataSensor.id,
          },
          data: {
            last_base_value: calculateValues.lastBaseValue,
            last_valueX: calculateValues.lastValueX,
            last_valueY: calculateValues.lastValueY,
            last_valueZ: calculateValues.lastValueZ,
            counter: 0,
            alarm_counter: 0, // Reset alarm counter on valid value
          },
        });
        const lastValuesForSend = {
          sensor_id: prevDataSensor.sensor_id,
          last_base_value: calculateValues.lastBaseValue,
          last_valueX: calculateValues.lastValueX,
          last_valueY: calculateValues.lastValueY,
          last_valueZ: calculateValues.lastValueZ,
          base_zero: valuesForSend.base_zero,
          min_base: valuesForSend.min_base,
          max_base: valuesForSend.max_base
        };
        // console.log('отправка данных ----', lastValuesForSend);
        await this.sseService.sendLastValues(lastValuesForSend);
      }
    } else {
      await this.dbService.requestSensorInfo.update({
        where: {
          id: prevDataSensor.id,
        },
        data: {
          counter: 0,
          alarm_counter: 0,
        },
      });
    }
  }
}
