import { Injectable } from '@nestjs/common';
import parseSensorInD3 from './parse-sensorIn-d3';
import { calculateDistance } from './calculate-distance-d3';
import parseSensorRf251 from './parse-sensor-rf251';
import { PrismaService } from '../prisma/prisma.service';
import { SseService } from '../sse/sse.service';
import { TelegramService } from '../telegram/telegram.service';
import { SensorUtilsService } from '../utils/sensor-utils.service';
interface ParsedDataInD3 {
  angleX: number;
  angleY: number;
}

interface ParsedDataRf251 {
  distance: number;
  temperature: number;
}

// Интерфейс для результата вычислений
interface CalculatedValues {
  lastValueX: number | null;
  lastValueY: number | null;
  lastBaseValue: number | null;
  lastValueZ: number | null;
}

interface FoundLimitValues {
  id: number;
  sensor_id: string;
  factory_number: string;
  unit_of_measurement: string;
  installation_location: string;
  coefficient: number;
  limitValue: number;
  emissionsQuantity: number;
  errorsQuantity: number;
  missedConsecutive: number;
  minQuantity: number;
  maxQuantity: number;
  additionalSensorInfoNotation: string;
}

interface SensorInfo {
  id: number;
  sensor_id: string;
  last_base_value: number | null;
  min_base: number | null;
  max_base: number | null;
  counter: number;
  alarm_counter: number;
  under_counter: number;
  over_counter: number;
}

interface Entry {
  sensor_id: string,
  request_code: string,
  answer_code: string,
  created_at: Date,
}

@Injectable()
export class CalculateService {
  constructor(private dbService: PrismaService,
              private sseService: SseService,
              private telegramService: TelegramService,
              private sensorUtilsService: SensorUtilsService) {}

  async convertStringToNumber(stringValue) {
    // Проверяем, является ли строка допустимым числом с запятой, точкой или отрицательным знаком
    const numericSingleCommaOrDotRegex = /^-?[0-9]+([,.][0-9]{1,2})?$/;
    if (!numericSingleCommaOrDotRegex.test(stringValue)) {
      throw new Error('Строка не является допустимым числом с запятой, точкой или с отрицательным знаком');
    }
    // Определяем, содержит ли строка запятую или точку, и выполняем соответствующую операцию
    if (stringValue.includes(',')) {
      // Преобразуем строку в число, заменяя запятую на точку
      return parseFloat(stringValue.replace(',', '.'));
    } else if (stringValue.includes('.')) {
      // Преобразуем строку в число без замены символов
      return parseFloat(stringValue);
    }
    // Если строка не содержит ни запятой, ни точки, преобразуем ее в целое число
    return parseInt(stringValue, 10);
  }
  async calculateALLValues(model: string, code: string, coefficient: number): Promise<CalculatedValues> {
    switch (model) {
      case 'ИН-Д3': {
        const parsedData: ParsedDataInD3 = parseSensorInD3(code, coefficient);
        return {
          lastValueX: parsedData.angleX,
          lastValueY: parsedData.angleY,
          lastBaseValue: calculateDistance(parsedData.angleX, parsedData.angleY),
          lastValueZ: 0,
        };
      }
      case 'РФ-251': {
        const parsedData: ParsedDataRf251 = parseSensorRf251(code, coefficient);
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

  async convertDataForCreate(entry: Entry, model: string): Promise<void> {
    try{
      const prevDataSensor: SensorInfo = await this.dbService.requestSensorInfo.findFirst({
      where: {
        sensor_id: entry.sensor_id,
      },
      });
      const foundLimitValues: FoundLimitValues = await this.dbService.additionalSensorInfo.findFirst({
        where: {
          sensor_id: entry.sensor_id,
        },
      });

      const calculateValues = await this.calculateALLValues(model, entry.answer_code, foundLimitValues.coefficient);
      const lastValues = calculateValues.lastBaseValue;

      if (lastValues === null || lastValues === undefined) {
        await this.handleCheckAndIncrementCounterError(prevDataSensor, foundLimitValues);
        return;
      }

      const limitValues = foundLimitValues.limitValue;
      const maxValues = prevDataSensor.max_base;
      const minValues = prevDataSensor.min_base;
      if (Math.abs(lastValues) >= Math.abs(limitValues)) {
        await this.handleCheckAndIncrementCounterAlarm(prevDataSensor, foundLimitValues);
      } else if (lastValues <= minValues) {
        await this.handleCheckAndIncrementCounterMin(prevDataSensor,calculateValues, foundLimitValues);
      } else if (lastValues >= maxValues) { // Fixed the comparison operator here
        await this.handleCheckAndIncrementCounterMax(prevDataSensor, calculateValues, foundLimitValues);
      } else {
        await this.handleValidBaseValue(prevDataSensor, calculateValues);
      }
    } catch (e) {
      console.log('Error', e);
    }
  }

  private async handleCheckAndIncrementCounterAlarm(prevDataSensor: SensorInfo, foundLimitValues: FoundLimitValues): Promise<void> {
    const newValue = prevDataSensor.alarm_counter + 1;
    await this.dbService.requestSensorInfo.update({
      where: {
        id: prevDataSensor.id,
      },
      data: {
        alarm_counter: newValue,
      },
    });
    if (newValue >= foundLimitValues.emissionsQuantity) {
      const message = `Выбросов подряд больше ${foundLimitValues.emissionsQuantity}`
      await this.createNewLogInDB(prevDataSensor.sensor_id, message)
      await this.dbService.requestSensorInfo.update({
        where: {
          id: prevDataSensor.id,
        },
        data: {
          alarm_counter: 0,
        },
      });
    }
  }

  private async handleCheckAndIncrementCounterError(prevDataSensor: SensorInfo, foundLimitValues: FoundLimitValues): Promise<void> {
    const newValue = prevDataSensor.counter + 1;
    await this.dbService.requestSensorInfo.update({
      where: {
        id: prevDataSensor.id,
      },
      data: {
        counter: newValue,
      },
    });
    if (newValue >= foundLimitValues.errorsQuantity) {
      const message = `Ошибок подряд больше ${foundLimitValues.errorsQuantity} раз`

      await this.createNewLogInDB(prevDataSensor.sensor_id, message)
      await this.dbService.requestSensorInfo.update({
        where: {
          id: prevDataSensor.id,
        },
        data: {
          counter: 0,
        },
      });
    }
  }
  private async handleCheckAndIncrementCounterMin(
    prevDataSensor: SensorInfo,
    calculateValues: CalculatedValues,
    foundLimitValues: FoundLimitValues
  ): Promise<void> {
    const newValue = prevDataSensor.under_counter + 1;

    // Update the sensor info with the new under_counter value
    await this.updateSensorInfo(prevDataSensor.id, calculateValues, { under_counter: newValue });

    // Check if the under_counter has reached the minQuantity limit
    if (newValue >= foundLimitValues.minQuantity) {
      // Reset the under_counter if the limit is reached
      const message = `Значение ниже минимума ${foundLimitValues.minQuantity} раз подряд`
      await this.createNewLogInDB(prevDataSensor.sensor_id, message)
      await this.resetCounter(prevDataSensor.id, 'under_counter');
    }
  }
  private async handleCheckAndIncrementCounterMax(
    prevDataSensor: SensorInfo,
    calculateValues: CalculatedValues,
    foundLimitValues: FoundLimitValues
  ): Promise<void> {
    const newValue = prevDataSensor.over_counter + 1;

    // Update the sensor info with the new over_counter value
    await this.updateSensorInfo(prevDataSensor.id, calculateValues, { over_counter: newValue });

    // Check if the over_counter has reached the maxQuantity limit
    if (newValue >= foundLimitValues.maxQuantity) {
      // Reset the over_counter if the limit is reached
      const message = `Значение выше максимума ${foundLimitValues.maxQuantity} раз подряд`
      await this.createNewLogInDB(prevDataSensor.sensor_id, message);
      await this.resetCounter(prevDataSensor.id, 'over_counter');
    }
  }

  private async handleValidBaseValue(
    prevDataSensor: SensorInfo,
    calculateValues: CalculatedValues
  ): Promise<void> {
    const isValueChanged = calculateValues.lastBaseValue !== prevDataSensor.last_base_value;
    // If the value has changed, reset counters and update the sensor info
    if (isValueChanged) {
      await this.updateSensorInfo(prevDataSensor.id, calculateValues, {
        counter: 0,
        alarm_counter: 0,
        over_counter: 0,
        under_counter: 0,
      });
    } else {
      // If the value has not changed, reset only the counters without updating the last values
      await this.resetAllCounters(prevDataSensor.id);
    }
  }

  private async updateSensorInfo(
    sensorId: number,
    calculateValues: CalculatedValues,
    counterUpdates: Partial<SensorInfo>
  ): Promise<void> {
    await this.dbService.requestSensorInfo.update({
      where: { id: sensorId },
      data: {
        last_base_value: calculateValues.lastBaseValue,
        last_valueX: calculateValues.lastValueX,
        last_valueY: calculateValues.lastValueY,
        last_valueZ: calculateValues.lastValueZ,
        ...counterUpdates,
      },
    });
  }

  private async resetCounter(sensorId: number, counterName: keyof SensorInfo): Promise<void> {
    await this.dbService.requestSensorInfo.update({
      where: { id: sensorId },
      data: {
        [counterName]: 0,
      },
    });
  }

  private async createNewLogInDB (sensorId: string, message: string): Promise<void> {
    const details = await this.sensorUtilsService.getSensorAndObjectDetails(sensorId)
    const organizationId = details.object.organization.id;
    const errorsMessage = `На объекте ${details.object.name} ${details.object.address} датчик: ${details.model} ${details.designation} ошибка: ${message} `;
    console.log('errorsMessage ---', errorsMessage)
    await this.sensorUtilsService.openingCheckAndSendMessageToTelegram(organizationId,errorsMessage);
    // await this.telegramService.sendMessage(1081994928, errorsMessage);
    await this.dbService.sensorErrorsLog.create( {  data: {
        sensor_id: sensorId,
        error_information: errorsMessage,
        created_at: new Date(),
      }, })
  }

  private async resetAllCounters(sensorId: number): Promise<void> {
    await this.dbService.requestSensorInfo.update({
      where: { id: sensorId },
      data: {
        counter: 0,
        alarm_counter: 0,
        over_counter: 0,
        under_counter: 0,
      },
    });
  }
}
