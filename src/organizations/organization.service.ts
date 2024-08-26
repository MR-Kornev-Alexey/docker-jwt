import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CheckService } from '../check/check.service';

@Injectable()
export class OrganizationService {
  constructor(private dbService: PrismaService,
              private checkService: CheckService) {
  }


  private async findOrganizationByInn(inn: string) {
    return this.dbService.m_Organisation.findFirst({
      where: { inn: inn },
    });
  }

  async initialNewMainOrganization(dto: any) {
    console.log('dto -', dto);
    try {
      const checkOrganization = await this.findOrganizationByInn(dto.inn);
      if (checkOrganization) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Данная организация уже внесена в базу',
          allOrganizations: await this.dbService.m_Organisation.findMany(),
          organization: checkOrganization,
        };
      } else {
        const createdOrganization = await this.dbService.m_Organisation.create({
          data: dto,
        });
        if (createdOrganization) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Главная организация успешно внесена в базу',
            organization: createdOrganization,
          };
        } else {
          throw new Error('Ошибка записи данных');
        }
      }
    } catch (error) {
      // Обрабатываем ошибку при создании объекта
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка при записи данных' };
    }
  }

  async createNewOrganization(dto: any) {
    console.log('dto -', dto);
    const checkAccess = await this.checkService.checkUserAccess(dto.email);
    if (checkAccess) {
      try {
        const checkOrganization = await this.findOrganizationByInn(dto.organizationsData.inn);
        if (checkOrganization) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Данная организация уже внесена в базу',
            allOrganizations: await this.dbService.m_Organisation.findMany(),
          };
        } else {
          const createdOrganization = await this.dbService.m_Organisation.create({
            data: dto.organizationsData,
          });
          if (createdOrganization) {
            return {
              statusCode: HttpStatus.OK,
              message: 'Данная организация успешно внесена в базу',
              allOrganizations: await this.dbService.m_Organisation.findMany(),
            };
          } else {
            throw new Error('Ошибка записи данных');
          }
        }
      } catch (error) {
        // Обрабатываем ошибку при создании объекта
        return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка при записи данных' };
      }
    } else {
      // Если доступ запрещен, возвращаем соответствующий статус и сообщение
      return { statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
    }
  }


  async deleteOneOrganization(dto) {
    console.log('dto -', dto);
    const { organizationId } = dto;

    try {
      // Проверяем, существует ли организация
      const findOrganization = await this.dbService.m_Organisation.findFirst({
        where: { id: organizationId },
      });

      if (!findOrganization) {
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Организация не найдена`,
        };
      }

      // Начинаем транзакцию для выполнения каскадного удаления
      await this.dbService.$transaction(async (prisma) => {
        // Удаляем данные, связанные с сенсорами, начиная с зависимых таблиц
        await prisma.additionalSensorInfo.deleteMany({
          where: {
            sensor: {
              object: {
                organization_id: organizationId,
              },
            },
          },
        });

        await prisma.sensorOperationLog.deleteMany({
          where: {
            sensor: {
              object: {
                organization_id: organizationId,
              },
            },
          },
        });

        await prisma.sensorErrorsLog.deleteMany({
          where: {
            sensor: {
              object: {
                organization_id: organizationId,
              },
            },
          },
        });

        await prisma.sensorFile.deleteMany({
          where: {
            sensor: {
              object: {
                organization_id: organizationId,
              },
            },
          },
        });

        await prisma.requestSensorInfo.deleteMany({
          where: {
            sensor: {
              object: {
                organization_id: organizationId,
              },
            },
          },
        });

        await prisma.dataFromSensor.deleteMany({
          where: {
            sensor: {
              object: {
                organization_id: organizationId,
              },
            },
          },
        });

        // Удаляем датчики, привязанные к объектам организации
        await prisma.new_Sensor.deleteMany({
          where: {
            object: {
              organization_id: organizationId,
            },
          },
        });

        // Удаляем объекты, связанные с организацией
        await prisma.m_Object.deleteMany({
          where: { organization_id: organizationId },
        });

        // Удаляем пользователей, привязанных к организации
        await prisma.m_User.deleteMany({
          where: { organization_id: organizationId },
        });

        // Удаляем саму организацию
        await prisma.m_Organisation.delete({
          where: { id: organizationId },
        });
      });

      return {
        statusCode: HttpStatus.OK,
        message: `Организация и все связанные данные успешно удалены`,
        allOrganizations: await this.dbService.m_Organisation.findMany(),
      };
    } catch (error) {
      console.error('Ошибка при удалении организации:', error);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Ошибка при удалении данных: ${error.message}`,
      };
    }
  }



  async checkOrganization(dto) {
    console.log('dto -', dto);
    try {
      const checkOrganization = await this.findOrganizationByInn(dto.inn);
      if (checkOrganization) {
        return {
          statusCode: HttpStatus.OK,
          organization: checkOrganization,
          message: 'Основная организация загружена',
        };
      } else {
        return { statusCode: HttpStatus.OK, organization: '', message: 'Основная организация не загружена' };
      }
    } catch (error) {
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: `Ошибка при записи данных: ${error}` };
    }

  }

  async getAllOrganizationsApi() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Успешное выполнение операции',
      allOrganizations: await this.dbService.m_Organisation.findMany(),
    };
  }
}
