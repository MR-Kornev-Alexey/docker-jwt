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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorController = void 0;
const common_1 = require("@nestjs/common");
const sensor_service_1 = require("./sensor.service");
const platform_express_1 = require("@nestjs/platform-express");
const check_service_1 = require("../check/check.service");
let SensorController = class SensorController {
    constructor(sensorService, checkService) {
        this.sensorService = sensorService;
        this.checkService = checkService;
    }
    async setNewSensorToObject(dto) {
        return await this.sensorService.createNewSensorToObject(dto);
    }
    async getAllObject(dto) {
        return await this.sensorService.getAllSensors(dto);
    }
    async getAllTypeOfSensors(dto) {
        return await this.sensorService.getAllTypeOfSensors(dto);
    }
    async getAllDataAboutOneSensor(dto) {
        return await this.sensorService.getAllDataAboutOneSensor(dto);
    }
    async initAllNewTypeSensor(dto) {
        return await this.sensorService.initAllNewTypeSensor(dto);
    }
    async setAdditionalDataForSensor(dto) {
        return await this.sensorService.setAdditionalDataForSensor(dto);
    }
    async setLogDataForSensor(dto) {
        return await this.sensorService.setLogDataForSensor(dto);
    }
    async createNewTypeSensor(dto) {
        return await this.sensorService.createNewTypeSensor(dto);
    }
    async changeIPForSensor(dto) {
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (!checkAccess) {
            throw new common_1.HttpException('Доступ запрещен', common_1.HttpStatus.FORBIDDEN);
        }
        return await this.sensorService.changeIPForSensor(dto);
    }
    async importNewSensorsToObject(dto) {
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (!checkAccess) {
            throw new common_1.HttpException('Доступ запрещен', common_1.HttpStatus.FORBIDDEN);
        }
        return await this.sensorService.importNewSensorsToObject(dto);
    }
    async deleteOneSensorFromApi(dto) {
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (!checkAccess) {
            throw new common_1.HttpException('Доступ запрещен', common_1.HttpStatus.FORBIDDEN);
        }
        return await this.sensorService.deleteOneSensorFromApi(dto);
    }
    async uploadFile(body, file) {
        return await this.sensorService.saveFileAboutSensor(file, body.id);
    }
};
exports.SensorController = SensorController;
__decorate([
    (0, common_1.Post)('set_new_sensor_to_object'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "setNewSensorToObject", null);
__decorate([
    (0, common_1.Post)('get_all_sensors'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "getAllObject", null);
__decorate([
    (0, common_1.Post)('get_all_type_of_sensors'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "getAllTypeOfSensors", null);
__decorate([
    (0, common_1.Post)('get_all_data_about_one_sensor'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "getAllDataAboutOneSensor", null);
__decorate([
    (0, common_1.Post)('init_all_new_type_sensor'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "initAllNewTypeSensor", null);
__decorate([
    (0, common_1.Post)('set_additional_data_for_sensor'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "setAdditionalDataForSensor", null);
__decorate([
    (0, common_1.Post)('set_log_data_for_sensor'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "setLogDataForSensor", null);
__decorate([
    (0, common_1.Post)('create_new_type_sensor'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "createNewTypeSensor", null);
__decorate([
    (0, common_1.Post)('change_ip_for_sensor'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "changeIPForSensor", null);
__decorate([
    (0, common_1.Post)('import_new_sensors_to_object'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "importNewSensorsToObject", null);
__decorate([
    (0, common_1.Post)('delete_one_sensor_from_api'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "deleteOneSensorFromApi", null);
__decorate([
    (0, common_1.Post)('save_file_about_sensor'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({
        fileType: 'pdf',
    })
        .addMaxSizeValidator({
        maxSize: 5000000,
    })
        .build({
        exceptionFactory(error) {
            throw new common_1.HttpException(error, common_1.HttpStatus.BAD_REQUEST);
        },
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SensorController.prototype, "uploadFile", null);
exports.SensorController = SensorController = __decorate([
    (0, common_1.Controller)('sensors'),
    __metadata("design:paramtypes", [sensor_service_1.SensorService,
        check_service_1.CheckService])
], SensorController);
//# sourceMappingURL=sensor.controller.js.map