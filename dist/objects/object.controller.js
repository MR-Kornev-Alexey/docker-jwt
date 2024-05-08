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
exports.ObjectController = void 0;
const common_1 = require("@nestjs/common");
const object_service_1 = require("./object.service");
let ObjectController = class ObjectController {
    constructor(objectService) {
        this.objectService = objectService;
    }
    async createObject(dto) {
        return await this.objectService.createNewObject(dto);
    }
    async getAllObject(dto) {
        return await this.objectService.getAllObject(dto);
    }
};
exports.ObjectController = ObjectController;
__decorate([
    (0, common_1.Post)('create_new_object'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "createObject", null);
__decorate([
    (0, common_1.Post)('get_all_objects'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ObjectController.prototype, "getAllObject", null);
exports.ObjectController = ObjectController = __decorate([
    (0, common_1.Controller)('objects'),
    __metadata("design:paramtypes", [object_service_1.ObjectService])
], ObjectController);
//# sourceMappingURL=object.controller.js.map