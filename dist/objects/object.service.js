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
exports.ObjectService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const check_service_1 = require("../check/check.service");
let ObjectService = class ObjectService {
    constructor(dbService, checkService) {
        this.dbService = dbService;
        this.checkService = checkService;
    }
    async getAllObjectsFromDb() {
        const allObjects = await this.dbService.m_Object.findMany({
            include: {
                organization: true,
                Sensor: true,
            },
        });
        return { statusCode: common_1.HttpStatus.OK, message: 'Успешное выполнение операции', allObjects: allObjects };
    }
    async createNewObject(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                const createObject = await this.dbService.m_Object.create({
                    data: dto.objectsData
                });
                if (createObject) {
                    return await this.getAllObjectsFromDb();
                }
                else {
                    throw new Error('Ошибка при записи данных');
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
    async getAllObject(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            return this.getAllObjectsFromDb();
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
};
exports.ObjectService = ObjectService;
exports.ObjectService = ObjectService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        check_service_1.CheckService])
], ObjectService);
//# sourceMappingURL=object.service.js.map