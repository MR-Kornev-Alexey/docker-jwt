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
exports.OrganizationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const check_service_1 = require("../check/check.service");
let OrganizationService = class OrganizationService {
    constructor(dbService, checkService) {
        this.dbService = dbService;
        this.checkService = checkService;
    }
    async findOrganizationByInn(inn) {
        return this.dbService.m_Organisation.findFirst({
            where: { inn: inn }
        });
    }
    async initialNewMainOrganization(dto) {
        console.log("dto -", dto);
        try {
            const checkOrganization = await this.findOrganizationByInn(dto.inn);
            if (checkOrganization) {
                return {
                    statusCode: common_1.HttpStatus.OK,
                    message: 'Данная организация уже внесена в базу',
                    allOrganizations: await this.dbService.m_Organisation.findMany()
                };
            }
            else {
                const createdOrganization = await this.dbService.m_Organisation.create({
                    data: dto
                });
                if (createdOrganization) {
                    return {
                        statusCode: common_1.HttpStatus.OK,
                        message: 'Главная организация успешно внесена в базу',
                        organization: createdOrganization
                    };
                }
                else {
                    throw new Error('Ошибка записи данных');
                }
            }
        }
        catch (error) {
            return { statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка при записи данных' };
        }
    }
    async createNewOrganization(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                const checkOrganization = await this.findOrganizationByInn(dto.organizationsData.inn);
                if (checkOrganization) {
                    return {
                        statusCode: common_1.HttpStatus.OK,
                        message: 'Данная организация уже внесена в базу',
                        allOrganizations: await this.dbService.m_Organisation.findMany()
                    };
                }
                else {
                    const createdOrganization = await this.dbService.m_Organisation.create({
                        data: dto.organizationsData
                    });
                    if (createdOrganization) {
                        return {
                            statusCode: common_1.HttpStatus.OK,
                            message: 'Данная организация успешно внесена в базу',
                            allOrganizations: await this.dbService.m_Organisation.findMany()
                        };
                    }
                    else {
                        throw new Error('Ошибка записи данных');
                    }
                }
            }
            catch (error) {
                return { statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка при записи данных' };
            }
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
    async checkOrganization(dto) {
        console.log("dto -", dto);
        const checkOrganization = await this.findOrganizationByInn(dto.inn);
        console.log("checkOrganization -", checkOrganization);
        if (checkOrganization) {
            return { statusCode: common_1.HttpStatus.OK, organization: checkOrganization };
        }
        else {
            return { statusCode: common_1.HttpStatus.NOT_FOUND, organization: 'OrganizationNotFound' };
        }
    }
    async getAllOrganizationsApi() {
        return {
            statusCode: common_1.HttpStatus.OK,
            message: 'Успешное выполнение операции',
            allOrganizations: await this.dbService.m_Organisation.findMany()
        };
    }
};
exports.OrganizationService = OrganizationService;
exports.OrganizationService = OrganizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        check_service_1.CheckService])
], OrganizationService);
//# sourceMappingURL=organization.service.js.map