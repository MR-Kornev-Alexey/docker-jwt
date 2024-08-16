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

    // Функция для получения всех объектов из базы данных
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