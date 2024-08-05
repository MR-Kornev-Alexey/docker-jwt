import {Injectable, HttpStatus} from '@nestjs/common';
import {PrismaService} from 'src/prisma/prisma.service';
import {additionalDataDto} from "../auth/dto/additionalData.dto";
import e from 'express';

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

    async deleteOneCustomer(dto) {
        console.log(dto);
        const { idCustomer } = dto;  // Destructuring for better readability
        try {
            const findCustomer = await this.dbService.m_User.findFirst({
                where: { id: idCustomer },
            });
            console.log(findCustomer);

            const findAddDataCustomer = await this.dbService.m_AdditionalUserInfo.findFirst({
                where: { user_id: idCustomer },
            });
            console.log(findAddDataCustomer);

            if (findCustomer === null) {
                console.log('No records found to delete.');
                return { statusCode: HttpStatus.BAD_REQUEST, message: "Пользователь не найден" };
            }
            if (findAddDataCustomer !== null) {
                await this.dbService.m_AdditionalUserInfo.delete({
                    where: { user_id: idCustomer },
                });
                console.log('Deleted additional customer data.');
            }

            await this.dbService.m_User.delete({
                where: { id: idCustomer },
            });
            console.log('Deleted record from m_User table.');
            const allUsers = await this.getAllCustomers();
            return { statusCode: HttpStatus.OK, message: "Пользователь удален", allUsers };
        } catch (error) {
            console.error("Произошла ошибка при удалении пользователя:", error);
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: "Ошибка удаления пользователя" };
        }
    }

    async createNewCustomer(dto) {
        console.log(dto);
        const { email } = dto;  // Destructuring for better readability
        try {
            const existingUser = await this.dbService.m_User.findUnique({
                where: { email },
            });

            if (existingUser) {
                return { statusCode: HttpStatus.BAD_REQUEST, message: "Пользователь с таким Email уже создан" };
            }

            const newUser = await this.dbService.m_User.create({ data: dto });
            if (newUser) {
                const allUsers = await this.getAllCustomers();
                return { statusCode: HttpStatus.OK, message: "Пользователь создан", allUsers };
            }

            return { statusCode: HttpStatus.BAD_REQUEST, message: "Ошибка создания пользователя" };
        } catch (error) {
            console.error("Произошла ошибка при создании пользователя:", error);
            return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: "Ошибка создания пользователя" };
        }
    }

    async getAllCustomers() {
        // Fetch all users with necessary fields
        return this.dbService.m_User.findMany({
            include: {
                organization: true, // Include related fields as needed
            },
        });
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
        if(findCustomer){
            return {statusCode: HttpStatus.OK, message: "Пользователь найден", customer: findCustomer};
        } else {
            return {statusCode: HttpStatus.NOT_FOUND, message: "Пользователь не найден", customer: ''}
        }

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
