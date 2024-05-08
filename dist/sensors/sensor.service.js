"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const check_service_1 = require("../check/check.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let SensorService = class SensorService {
    constructor(dbService, checkService) {
        this.dbService = dbService;
        this.checkService = checkService;
    }
    async saveSensorsData(objectId, sensorsData) {
        for (const row of sensorsData) {
            await this.dbService.new_Sensor.create({
                data: {
                    object: { connect: { id: objectId } },
                    sensor_type: row[3],
                    sensor_key: row[4],
                    model: row[2],
                    designation: row[1],
                    network_number: parseInt(row[0])
                }
            });
        }
    }
    async setLogDataForSensor(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                const createLogDataForSensor = await this.dbService.sensorOperationLog.create({
                    data: dto.jsonData
                });
                if (createLogDataForSensor) {
                    return {
                        statusCode: common_1.HttpStatus.OK,
                        message: 'Успешная запись данных',
                        oneSensor: createLogDataForSensor
                    };
                }
                else {
                    throw new Error('Ошибка при записи данных о датчике');
                }
            }
            catch (error) {
                return { statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при записи данных' };
            }
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
    async setAdditionalDataForSensor(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                const createAdditionalDataForSensor = await this.dbService.additionalSensorInfo.create({
                    data: dto.additionalDataForSensor
                });
                if (createAdditionalDataForSensor) {
                    return {
                        statusCode: common_1.HttpStatus.OK,
                        message: 'Успешная запись данных',
                        oneSensor: createAdditionalDataForSensor
                    };
                }
                else {
                    throw new Error('Ошибка при записи данных о датчике');
                }
            }
            catch (error) {
                return { statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при записи данных' };
            }
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
    async initAllNewTypeSensor(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                for (const [sensorKey, sensorData] of Object.entries(dto.jsonData)) {
                    await this.dbService.type_Sensor.upsert({
                        where: { sensor_key: sensorKey },
                        update: {},
                        create: {
                            sensor_key: sensorKey,
                            sensor_type: sensorData.type,
                            models: Array.isArray(sensorData.model) ? sensorData.model : [sensorData.model]
                        },
                    });
                }
                return {
                    statusCode: common_1.HttpStatus.OK,
                    message: 'Успешный запрос',
                    allSensors: await this.getAllTypeSensorsFromDb()
                };
            }
            catch (error) {
                return { statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR, message: 'Ошибка 500 при записи данных' };
            }
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
    async getAllSensorsFromDb() {
        const allSensors = await this.dbService.new_Sensor.findMany({
            include: {
                object: true,
                additional_sensor_info: true,
                sensor_operation_log: true,
                files: true
            }
        });
        return { statusCode: common_1.HttpStatus.OK, message: 'Успешное выполнение операции', allSensors: allSensors };
    }
    async getAllTypeSensorsFromDb() {
        const allSensors = await this.dbService.type_Sensor.findMany();
        return { statusCode: common_1.HttpStatus.OK, message: 'Успешное выполнение операции', allSensors: allSensors };
    }
    async createNewSensorToObject(dto) {
        console.log("dto -- createNewSensorToObject", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                const createSensor = await this.dbService.new_Sensor.create({
                    data: dto.sensorsData
                });
                if (createSensor) {
                    return await this.getAllSensorsFromDb();
                }
                else {
                    throw new Error('Ошибка при записи данных о датчике');
                }
            }
            catch (error) {
                return {
                    statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Ошибка 500 при записи данных о датчике'
                };
            }
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
    async getAllSensors(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            return await this.getAllSensorsFromDb();
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
    async getAllDataAboutOneSensor(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            const oneSensor = await this.dbService.new_Sensor.findFirst({
                where: {
                    id: dto.id
                },
                include: {
                    object: true,
                    additional_sensor_info: true,
                    sensor_operation_log: true,
                    files: true
                },
            });
            return { statusCode: common_1.HttpStatus.OK, message: 'Успешное выполнение операции', oneSensor: oneSensor };
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
    async getAllTypeOfSensors(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            return await this.getAllTypeSensorsFromDb();
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
    async saveFileAboutSensor(file, dto) {
        let filePath;
        try {
            const uploadsFolder = './uploads';
            filePath = path.join(uploadsFolder, file.originalname);
            if (!fs.existsSync(uploadsFolder)) {
                fs.mkdirSync(uploadsFolder, { recursive: true });
            }
            fs.writeFileSync(filePath, file.buffer);
            const fileUrl = `http://localhost:5000/uploads/${file.originalname}`;
            const createFileResult = await this.dbService.sensorFile.create({
                data: {
                    url: fileUrl,
                    sensor_id: dto
                }
            });
            if (createFileResult) {
                return {
                    statusCode: common_1.HttpStatus.OK,
                    message: 'Успешное выполнение операции',
                    oneSensor: createFileResult
                };
            }
            else {
                fs.unlinkSync(filePath);
                throw new Error('Ошибка при записи данных о датчике');
            }
            return { fileUrl };
        }
        catch (error) {
            console.error('Произошла ошибка при сохранении файла:', error);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw error;
        }
    }
    async deleteOneSensorFromApi(dto) {
        console.log("dto -", dto);
        try {
            const relatedAdditionalSensorInfo = await this.dbService.additionalSensorInfo.findMany({
                where: { sensor_id: dto.id }
            });
            if (relatedAdditionalSensorInfo.length > 0) {
                await this.dbService.additionalSensorInfo.deleteMany({
                    where: { sensor_id: dto.id }
                });
            }
            const relatedSensorOperationLogs = await this.dbService.sensorOperationLog.findMany({
                where: { sensor_id: dto.id }
            });
            if (relatedSensorOperationLogs.length > 0) {
                await this.dbService.sensorOperationLog.deleteMany({
                    where: { sensor_id: dto.id }
                });
            }
            const relatedSensorFiles = await this.dbService.sensorFile.findMany({
                where: { sensor_id: dto.id }
            });
            if (relatedSensorFiles.length > 0) {
                await this.dbService.sensorFile.deleteMany({
                    where: { sensor_id: dto.id }
                });
            }
            await this.dbService.new_Sensor.delete({
                where: { id: dto.id }
            });
            return { statusCode: common_1.HttpStatus.OK, message: 'Датчик успешно удален из базы данных' };
        }
        catch (error) {
            console.error('Ошибка при удалении датчика:', error);
            return {
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Ошибка 500 при удалении датчика из базы данных'
            };
        }
    }
    async importNewSensorsToObject(dto) {
        console.log("dto -", dto);
        this.saveSensorsData(dto.object_id, dto.sensorsData)
            .then(() => {
            console.log('Данные успешно записаны в базу данных');
        })
            .catch(error => {
            console.error('Произошла ошибка при записи данных:', error);
        });
    }
    async changeIPForSensor(dto) {
        console.log("dto -", dto);
        try {
            const updatedSensor = await this.dbService.new_Sensor.update({
                where: { id: dto.id },
                data: { ip_address: dto.ip }
            });
            return { statusCode: common_1.HttpStatus.OK, message: 'Успешное выполнение операции', updatedSensor: updatedSensor };
        }
        catch (error) {
            console.error('Ошибка при записи IP address датчика:', error);
            return {
                statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Ошибка 500 при записи IP address датчика'
            };
        }
    }
    async createNewTypeSensor(dto) {
        console.log("dto -", dto);
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (checkAccess) {
            try {
                const existingSensor = await this.dbService.type_Sensor.findUnique({
                    where: { sensor_key: dto.sensorsData.sensor_key },
                });
                if (existingSensor) {
                    if (!existingSensor.models.includes(dto.sensorsData.model)) {
                        await this.dbService.type_Sensor.update({
                            where: { sensor_key: dto.sensorsData.sensor_key },
                            data: { models: { push: dto.sensorsData.model } },
                        });
                    }
                    return await this.getAllTypeSensorsFromDb();
                }
                else {
                    await this.dbService.type_Sensor.create({
                        data: {
                            sensor_key: dto.sensorsData.sensor_key,
                            sensor_type: dto.sensorsData.sensor_type,
                            models: [dto.sensorsData.model]
                        },
                    });
                    return await this.getAllTypeSensorsFromDb();
                }
            }
            catch (error) {
                console.error('Ошибка при создании датчика:', error);
                return {
                    statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Ошибка 500 при записи данных о датчике'
                };
            }
        }
        else {
            return { statusCode: common_1.HttpStatus.FORBIDDEN, message: 'Доступ запрещен' };
        }
    }
};
exports.SensorService = SensorService;
exports.SensorService = SensorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        check_service_1.CheckService])
], SensorService);
//# sourceMappingURL=sensor.service.js.map