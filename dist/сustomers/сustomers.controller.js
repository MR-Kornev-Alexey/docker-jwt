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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const _ustomers_service_1 = require("./\u0441ustomers.service");
const transform_password_pipe_1 = require("../auth/transform-password.pipe");
const check_service_1 = require("../check/check.service");
let CustomersController = class CustomersController {
    constructor(customersService, checkService) {
        this.customersService = customersService;
        this.checkService = checkService;
    }
    async getAllCustomers(dto) {
        return await this.customersService.getCustomers(dto);
    }
    async checkSuperVisor() {
        return await this.customersService.checkSV();
    }
    async checkAdditionalData(dto) {
        return await this.customersService.checkCustomersAddData(dto);
    }
    async createAdditionalData(dto) {
        return await this.customersService.createCustomersAddData(dto);
    }
    async getDataAboutOneCustomer(dto) {
        return await this.customersService.getDataAboutOneCustomer(dto);
    }
    async addNewCustomer(dto) {
        return await this.customersService.createNewCustomer(dto);
    }
    async deleteOneCustomer(dto) {
        const checkAccess = await this.checkService.checkUserAccess(dto.email);
        if (!checkAccess) {
            throw new common_1.HttpException('Доступ запрещен', common_1.HttpStatus.FORBIDDEN);
        }
        return await this.customersService.deleteOneCustomer(dto);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)('all_customers'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getAllCustomers", null);
__decorate([
    (0, common_1.Get)('find_role_customer'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "checkSuperVisor", null);
__decorate([
    (0, common_1.Post)('check_additional_data'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "checkAdditionalData", null);
__decorate([
    (0, common_1.Post)('init_additional_data_customer'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "createAdditionalData", null);
__decorate([
    (0, common_1.Post)('get_data_about_one_customer'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getDataAboutOneCustomer", null);
__decorate([
    (0, common_1.Post)('create_new_customer'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(transform_password_pipe_1.TransformPasswordPipe),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "addNewCustomer", null);
__decorate([
    (0, common_1.Post)('delete_one_customer'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "deleteOneCustomer", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('customers'),
    __metadata("design:paramtypes", [_ustomers_service_1.CustomersService,
        check_service_1.CheckService])
], CustomersController);
//# sourceMappingURL=%D1%81ustomers.controller.js.map