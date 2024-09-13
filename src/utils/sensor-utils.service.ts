import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from '../telegram/telegram.service';
import { SensorDetails } from '../types/sensor-details';

@Injectable()
export class SensorUtilsService {
  constructor(
    private dbService: PrismaService,
    private telegramService: TelegramService,
  ) {}

  private async sendNotifications(
    objectId: string,
    sensorId: string,
    errorMessage: string,
  ): Promise<void> {
    const timestamp = new Date();
    console.log('errorMessage before create --', errorMessage);
    try {
      // Use Promise.all to perform database operations concurrently
      await Promise.all([
        this.dbService.m_notifications.create({
          data: {
            object_id: objectId,
            information: errorMessage,
            created_at: timestamp,
          },
        }),
        this.dbService.sensorErrorsLog.create({
          data: {
            sensor_id: sensorId, // Ensure this can be nullable if needed
            error_information: errorMessage,
            created_at: timestamp,
          },
        }),
      ]);
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  }

  async openingCheckAndSendMessageToTelegram(organizationId, errorsMessage) {
    const users = await this.getAllUsersAboutOrganisation(organizationId);
    console.log(users);
    if (users.length > 0) {
      for (let i = 0; i < users.length; i++) {
        if (users[i].telegramInfo) {
          console.log(new Date(), errorsMessage);
          await this.telegramService.sendMessage(
            users[i].telegramId,
            errorsMessage,
          );
          await this.delay(5000);
        }
      }
    }
  }

  async getAllUsersAboutOrganisation(id) {
    return this.dbService.m_User.findMany({
      where: {
        organization_id: id,
      },
    });
  }

  async sendMessageAboutSensorAndObject(sensorId: string, inputMessage) {
    const details: SensorDetails =
      await this.getSensorAndObjectDetails(sensorId);
    const organizationId = details.object.organization.id;
    const users = await this.getAllUsersAboutOrganisation(organizationId);
    const missedCounter = details.additional_sensor_info[0].missedConsecutive;
    let iterationCounter = details.requestSensorInfo[0].counter;
    if (users.length > 0) {
      if (iterationCounter >= missedCounter) {
        const errorsMessage = `На объекте ${details.object.name} ${details.object.address} датчик: ${details.model} ${details.designation} ошибка: ${inputMessage}.\n${iterationCounter} раз подряд`;
        await this.sendNotifications(
          details.object.id,
          sensorId,
          errorsMessage,
        );
        await this.dbService.requestSensorInfo.update({
          where: {
            id: details.requestSensorInfo[0].id,
          },
          data: {
            counter: 0,
          },
        });
        for (let i = 0; i < users.length; i++) {
          if (users[i].telegramInfo) {
            console.log(new Date());
            await this.telegramService.sendMessage(
              users[i].telegramId,
              errorsMessage,
            );
            await this.delay(5000);
          }
        }
      } else {
        iterationCounter++; // Increment first, then use it for the update
        await this.dbService.requestSensorInfo.update({
          where: {
            id: details.requestSensorInfo[0].id,
          },
          data: {
            counter: iterationCounter,
          },
        });
      }
    }
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async getSensorAndObjectDetails(
    sensorId: string,
  ): Promise<SensorDetails | null> {
    try {
      const sensorDetails = await this.dbService.new_Sensor.findUnique({
        where: {
          id: sensorId,
        },
        select: {
          model: true,
          designation: true,
          object_id: true,
          additional_sensor_info: {
            select: {
              missedConsecutive: true,
            },
          },
          requestSensorInfo: {
            select: {
              id: true,
              counter: true,
            },
          },
          object: {
            select: {
              id: true,
              name: true,
              address: true,
              organization: {
                select: {
                  id: true,
                  users: {
                    select: {
                      telegramId: true,
                      telegramInfo: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!sensorDetails) {
        console.log('Sensor not found');
        return null;
      }
      // console.log('Sensor Details:', sensorDetails);
      return sensorDetails;
    } catch (error) {
      console.error('Error retrieving sensor details:', error);
      throw error;
    }
  }
}
