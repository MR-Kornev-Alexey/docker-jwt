import {Injectable, HttpStatus} from '@nestjs/common';
import {PrismaService} from 'src/prisma/prisma.service';
import {JwtService} from "@nestjs/jwt";
import {CheckService} from '../check/check.service';

@Injectable()
export class OrganizationService {
    constructor(private dbService: PrismaService,
                private checkService: CheckService) {
    }


    private async findOrganizationByInn(inn: string) {
        return this.dbService.m_Organisation.findFirst({
            where: {inn: inn}
        });
    }

    async initialNewMainOrganization(dto: any) {
        console.log("dto -", dto);
        try {
            const checkOrganization = await this.findOrganizationByInn(dto.inn);
            if (checkOrganization) {
                return {
                    statusCode: HttpStatus.OK,
                    message: 'Данная организация уже внесена в базу',
                    allOrganizations: await this.dbService.m_Organisation.findMany(),
                    organization: checkOrganization
                };
            } else {
                const createdOrganization = await this.dbService.m_Organisation.create({
                    data: dto
                });
                if (createdOrganization) {
                    return {
                        statusCode: HttpStatus.OK,
                        message: 'Главная организация успешно внесена в базу',
                        organization: createdOrganization
                    };
                } else {
                    throw new Error('Ошибка записи данных');
                }
            }
        } catch (error) {
            // Обрабатываем ошибку при создании объекта
            return {statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка при записи данных'};
        }
    }

    async createNewOrganization(dto: any) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                const checkOrganization = await this.findOrganizationByInn(dto.organizationsData.inn);
                if (checkOrganization) {
                    return {
                        statusCode: HttpStatus.OK,
                        message: 'Данная организация уже внесена в базу',
                        allOrganizations: await this.dbService.m_Organisation.findMany()
                    };
                } else {
                    const createdOrganization = await this.dbService.m_Organisation.create({
                        data: dto.organizationsData
                    });
                    if (createdOrganization) {
                        return {
                            statusCode: HttpStatus.OK,
                            message: 'Данная организация успешно внесена в базу',
                            allOrganizations: await this.dbService.m_Organisation.findMany()
                        };
                    } else {
                        throw new Error('Ошибка записи данных');
                    }
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

    async checkOrganization(dto) {
        console.log("dto -", dto)
        try{
            const checkOrganization = await this.findOrganizationByInn(dto.inn);
            if (checkOrganization) {
                return {statusCode: HttpStatus.OK, organization: checkOrganization, message: "Основная организация загружена"};
            } else {
                return {statusCode: HttpStatus.OK, organization: '', message: "Основная организация не загружена" };
            }
        } catch (error) {
            return {statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: `Ошибка при записи данных: ${error}`};
        }

    }

    async getAllOrganizationsApi() {
        return {
            statusCode: HttpStatus.OK,
            message: 'Успешное выполнение операции',
            allOrganizations: await this.dbService.m_Organisation.findMany()
        };
    }
}
