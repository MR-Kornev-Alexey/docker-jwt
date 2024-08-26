// sensor.service.ts
import {Injectable, HttpStatus} from '@nestjs/common';
import {PrismaService} from 'src/prisma/prisma.service';
import {ObjectFormInput} from "../types/objectFormInput";
import {CheckService} from '../check/check.service'; // Импортируем CheckService

@Injectable()
export class ObjectService {
    constructor(
        private dbService: PrismaService,
        private checkService: CheckService // Внедряем CheckService
    ) {
    }
    async getAllObjectsFromDb() {
        const allObjects = await this.dbService.m_Object.findMany({
            include: {
                organization: true, // Включаем связанную модель организации
                Sensor: {
                    include: {
                        requestSensorInfo: true,
                        additional_sensor_info: true
                    }
                }
            },
        });
        return {statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', allObjects: allObjects};
    }

    async deleteOneObject(dto: ObjectFormInput) {
        console.log("dto -", dto);
        const { objectId } = dto;
        try {
            // Проверяем, существует ли организация
            const findObject = await this.dbService.m_Object.findFirst({
                where: { id: objectId },
            });
            if (!findObject) {
                return {
                    statusCode: HttpStatus.NOT_FOUND,
                    message: `Объект не найден`,
                };
            }
            await this.dbService.$transaction(async (prisma) => {
                // Удаляем данные, связанные с сенсорами, начиная с зависимых таблиц
                await prisma.additionalSensorInfo.deleteMany({
                    where: {
                        sensor: {
                            object: {
                                id: objectId,
                            },
                        },
                    },
                });

                await prisma.sensorOperationLog.deleteMany({
                    where: {
                        sensor: {
                            object: {
                                id: objectId,
                            },
                        },
                    },
                });

                await prisma.sensorErrorsLog.deleteMany({
                    where: {
                        sensor: {
                            object: {
                                id: objectId,
                            },
                        },
                    },
                });

                await prisma.sensorFile.deleteMany({
                    where: {
                        sensor: {
                            object: {
                                id: objectId,
                            },
                        },
                    },
                });

                await prisma.requestSensorInfo.deleteMany({
                    where: {
                        sensor: {
                            object: {
                                id: objectId,
                            },
                        },
                    },
                });

                await prisma.dataFromSensor.deleteMany({
                    where: {
                        sensor: {
                            object: {
                                id: objectId,
                            },
                        },
                    },
                });

                // Удаляем датчики, привязанные к объекту
                await prisma.new_Sensor.deleteMany({
                    where: {
                        object: {
                            id: objectId
                        },
                    },
                });
                // Удаляем объект
                await prisma.m_Object.delete({
                    where: {   id: objectId },
                });
            });
            return this.getAllObjectsFromDb();
        } catch (error) {
            console.error('Ошибка при удалении объекта:', error);
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: `Ошибка при удалении данных: ${error.message}`,
            };
        }
    }
    async createNewObject(dto: ObjectFormInput) {
        console.log("dto -", dto);

        // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                // Создаем новый объект в базе данных
                const createObject = await this.dbService.m_Object.create({
                    data: dto.objectsData
                });
                if (createObject) {
                    return await this.getAllObjectsFromDb();
                } else {
                    // Если создание объекта не удалось, выбрасываем ошибку
                    throw new Error('Ошибка при записи данных');
                }
            } catch (error) {
                // Обрабатываем ошибку при создании объекта
                return {statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка при записи данных'};
            }
        } else {
            // Если доступ запрещен, возвращаем соответствующий статус и сообщение
            return {statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен'};
        }
    }

    async getAllObject(dto: { email: string }) {
        console.log("dto -", dto);
        // Проверяем доступ пользователя с помощью метода checkUserAccess из CheckService
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            return this.getAllObjectsFromDb();
        } else {
            // Если доступ запрещен, возвращаем соответствующий статус и сообщение
            return {statusCode: HttpStatus.FORBIDDEN, message: 'Доступ запрещен'};
        }
    }
}