import {Injectable, HttpStatus} from '@nestjs/common';
import {PrismaService} from 'src/prisma/prisma.service';
import {additionalDataDto} from "../auth/dto/additionalData.dto";

@Injectable()
export class CustomersService {
    constructor(private dbService: PrismaService) {
    }


    private async checkUserAccess(email: string): Promise<boolean> {
        const checkUser = await this.dbService.m_User.findFirst({
            where: {email: email}
        });
        return checkUser?.role === "admin" || checkUser?.role === "supervisor";
    }

    async checkCustomersAddData(dto) {
        console.log(dto)
        const findId = await this.dbService.m_User.findFirst(
            {
                where: {email: dto.email},
                include: {
                    organization: true,
                    additionalUserInfo: true
                }
            }
        );
        const checkAddData = await this.dbService.m_AdditionalUserInfo.findFirst(
            {
                where: {user_id: findId.id}
            }
        );
        if (checkAddData) {
            return {statusCode: HttpStatus.OK, additionalData: findId};
        } else {
            return {statusCode: HttpStatus.NOT_FOUND};
        }
    }

    async getCustomers(dto) {
        const userAccess = await this.checkUserAccess(dto.email);
        if (!userAccess) {
            return {statusCode: HttpStatus.FORBIDDEN, message: "userNotAccess"};
        }

        const checkCustomers = await this.dbService.m_User.findMany({
            include: {
                organization: true ,
                additionalUserInfo: true
            }
        });

        return checkCustomers ? {
            statusCode: HttpStatus.OK,
            allUsers: checkCustomers
        } : {statusCode: HttpStatus.NOT_FOUND, allUsers: []};
    }

    async checkSV() {
        const checkSV = await this.dbService.m_User.findFirst({where: {role: "supervisor"}});
        return checkSV ? {statusCode: HttpStatus.OK} : {statusCode: HttpStatus.NOT_FOUND};
    }

    async deleteOneCustomer(dto: any) {
        console.log(dto);

        try {
            let findAddData = await this.dbService.m_AdditionalUserInfo.findFirst({
                where: { user_id: dto.idUser },
            });

            if (findAddData) {
                await this.dbService.m_AdditionalUserInfo.deleteMany({
                    where: { user_id: dto.idUser },
                });
            }

            let deleteOne = await this.dbService.m_User.deleteMany({
                where: { id: dto.idUser },
            });

            if (deleteOne) {
                const checkCustomers = await this.dbService.m_User.findMany({
                    include: {
                        organization: true ,
                        additionalUserInfo: true
                    }
                });
                return { statusCode: HttpStatus.OK, message: "Пользователь удален", allUsers: checkCustomers };
            } else {
                return { statusCode: HttpStatus.BAD_REQUEST, message: "Ошибка удаления пользователя" };
            }
        } catch (error) {
            console.error("Произошла ошибка при удалении пользователя:", error);
            return { statusCode: HttpStatus.BAD_REQUEST, message: "Ошибка удаления пользователя" };
        }
    }


    async createNewCustomer(dto: any) {
        console.log(dto)
        const findId = await this.dbService.m_User.findUnique({
            where: {email: dto.email}
        });

        if (findId) {
            return {statusCode: HttpStatus.BAD_REQUEST, message: "Пользователь с таким Email уже создан"};
        }
        const newUserCreate = await this.dbService.m_User.create({data: dto});
        if (newUserCreate) {
            const checkCustomers = await this.dbService.m_User.findMany({
                include: {
                    organization: true // Или другие поля, которые вам нужны из организации
                }
            });
            return {statusCode: HttpStatus.OK, message: "Пользователь создан", allUsers: checkCustomers};
        } else {
            return {statusCode: HttpStatus.BAD_REQUEST, message: "Error of create User"};
        }
    }
    async getDataAboutOneCustomer(dto: any) {
        console.log(dto)
        const findCustomer = await this.dbService.m_User.findFirst(
            {
                where: {email: dto.email},
                include: {
                    organization: true,
                    additionalUserInfo: true
                }
            }
        );
        return {statusCode: HttpStatus.OK, message: "Пользователь найден", customer: findCustomer};
    }

    async createCustomersAddData(dto: any) {
        console.log("dto - ", dto);
        try {
            const findId = await this.dbService.m_User.findUnique({
                where: { email: dto.email },
            });
            console.log("findId - ", findId);

            if (!findId) {
                return { statusCode: HttpStatus.BAD_REQUEST, message: "Пользователь не найден" };
            }

            let findAddData = await this.dbService.m_AdditionalUserInfo.findFirst({
                where: { user_id: findId.id },
            });
            console.log("findAddData - ", findAddData);

            let resultAddData;

            if (!findAddData) {
                // Если дополнительные данные не найдены, создаем новую запись
                const additionalData: additionalDataDto = {
                    user_id: findId.id,
                    firstName: dto.addData.firstName,
                    surName: dto.addData.surName,
                    telegram: dto.addData.telegram,
                    position: dto.addData.position,
                    phone: dto.addData.phone,
                };
                resultAddData = await this.dbService.m_AdditionalUserInfo.create({
                    data: additionalData
                });
                console.log("Первичная запись в базу ---", resultAddData);
            } else {
                // Если дополнительные данные найдены, обновляем существующую запись
                const additionalData: additionalDataDto = dto.addData;
                resultAddData = await this.dbService.m_AdditionalUserInfo.update({
                    where: { user_id: findId.id },
                    data: {
                        firstName: additionalData.firstName,
                        surName: additionalData.surName,
                        phone: additionalData.phone,
                        telegram: additionalData.telegram,
                        position: additionalData.position,
                        updated_at: new Date() // Обновляем дату обновления
                    }
                });
                console.log("Обновление данных в базе ---", resultAddData);
            }

            // Обновляем статус регистрации пользователя
            await this.dbService.m_User.update({
                where: { id: findId.id },
                data: { registration_status: "COMPLETED" },
            });

            // Получаем обновленные данные пользователя
            const newDataUser = await this.dbService.m_User.findUnique({
                where: { id: findId.id },
                include: {
                    organization: true,
                    additionalUserInfo: true
                }
            });

            return { statusCode: HttpStatus.OK, message: 'Успешное выполнение операции', customer: newDataUser };

        } catch (error) {
            console.error("Ошибка:", error);
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR };
        }
    }


}
