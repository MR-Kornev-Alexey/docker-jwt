"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    async checkUserAccess(email) {
        const checkUser = await this.dbService.m_User.findFirst({
            where: { email: email }
        });
        return checkUser?.role === "admin" || checkUser?.role === "supervisor";
    }
    async checkCustomersAddData(dto) {
        console.log(dto);
        const findId = await this.dbService.m_User.findFirst({
            where: { email: dto.email },
            include: {
                organization: true,
                additionalUserInfo: true
            }
        });
        const checkAddData = await this.dbService.m_AdditionalUserInfo.findFirst({
            where: { user_id: findId.id }
        });
        if (checkAddData) {
            return { statusCode: common_1.HttpStatus.OK, additionalData: findId };
        }
        else {
            return { statusCode: common_1.HttpStatus.NOT_FOUND };
        }
    }
    async getCustomers(dto) {
        const userAccess = await this.checkUserAccess(dto.email);
        if (!userAccess) {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: "userNotAccess" };
        }
        const checkCustomers = await this.dbService.m_User.findMany({
            include: {
                organization: true,
                additionalUserInfo: true
            }
        });
        return checkCustomers ? {
            statusCode: common_1.HttpStatus.OK,
            allUsers: checkCustomers
        } : { statusCode: common_1.HttpStatus.NOT_FOUND, allUsers: [] };
    }
    async checkSV() {
        const checkSV = await this.dbService.m_User.findFirst({ where: { role: "supervisor" } });
        return checkSV ? { statusCode: common_1.HttpStatus.OK } : { statusCode: common_1.HttpStatus.NOT_FOUND };
    }
    async deleteOneCustomer(dto) {
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
                        organization: true,
                        additionalUserInfo: true
                    }
                });
                return { statusCode: common_1.HttpStatus.OK, message: "Пользователь удален", allUsers: checkCustomers };
            }
            else {
                return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: "Ошибка удаления пользователя" };
            }
        }
        catch (error) {
            console.error("Произошла ошибка при удалении пользователя:", error);
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: "Ошибка удаления пользователя" };
        }
    }
    async createNewCustomer(dto) {
        console.log(dto);
        const findId = await this.dbService.m_User.findUnique({
            where: { email: dto.email }
        });
        if (findId) {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: "Пользователь с таким Email уже создан" };
        }
        const newUserCreate = await this.dbService.m_User.create({ data: dto });
        if (newUserCreate) {
            const checkCustomers = await this.dbService.m_User.findMany({
                include: {
                    organization: true
                }
            });
            return { statusCode: common_1.HttpStatus.OK, message: "Пользователь создан", allUsers: checkCustomers };
        }
        else {
            return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: "Error of create User" };
        }
    }
    async getDataAboutOneCustomer(dto) {
        console.log(dto);
        const findCustomer = await this.dbService.m_User.findFirst({
            where: { email: dto.email },
            include: {
                organization: true,
                additionalUserInfo: true
            }
        });
        return { statusCode: common_1.HttpStatus.OK, message: "Пользователь найден", customer: findCustomer };
    }
    async createCustomersAddData(dto) {
        console.log("dto - ", dto);
        try {
            const findId = await this.dbService.m_User.findUnique({
                where: { email: dto.email },
            });
            console.log("findId - ", findId);
            if (!findId) {
                return { statusCode: common_1.HttpStatus.BAD_REQUEST, message: "Пользователь не найден" };
            }
            let findAddData = await this.dbService.m_AdditionalUserInfo.findFirst({
                where: { user_id: findId.id },
            });
            console.log("findAddData - ", findAddData);
            let resultAddData;
            if (!findAddData) {
                const additionalData = {
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
            }
            else {
                const additionalData = dto.addData;
                resultAddData = await this.dbService.m_AdditionalUserInfo.update({
                    where: { user_id: findId.id },
                    data: {
                        firstName: additionalData.firstName,
                        surName: additionalData.surName,
                        phone: additionalData.phone,
                        telegram: additionalData.telegram,
                        position: additionalData.position,
                        updated_at: new Date()
                    }
                });
                console.log("Обновление данных в базе ---", resultAddData);
            }
            await this.dbService.m_User.update({
                where: { id: findId.id },
                data: { registration_status: "COMPLETED" },
            });
            const newDataUser = await this.dbService.m_User.findUnique({
                where: { id: findId.id },
                include: {
                    organization: true,
                    additionalUserInfo: true
                }
            });
            return { statusCode: common_1.HttpStatus.OK, message: 'Успешное выполнение операции', customer: newDataUser };
        }
        catch (error) {
            console.error("Ошибка:", error);
            return { statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR };
        }
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=%D1%81ustomers.service.js.map