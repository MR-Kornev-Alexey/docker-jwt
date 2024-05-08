"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const _ustomers_service_1 = require("./\u0441ustomers/\u0441ustomers.service");
const _ustomers_controller_1 = require("./\u0441ustomers/\u0441ustomers.controller");
const organization_controller_1 = require("./organizations/organization.controller");
const organization_service_1 = require("./organizations/organization.service");
const object_controller_1 = require("./objects/object.controller");
const object_service_1 = require("./objects/object.service");
const check_service_1 = require("./check/check.service");
const sensor_controller_1 = require("./sensors/sensor.controller");
const sensor_service_1 = require("./sensors/sensor.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController, _ustomers_controller_1.CustomersController, organization_controller_1.OrganizationController, object_controller_1.ObjectController, sensor_controller_1.SensorController],
        providers: [app_service_1.AppService, _ustomers_service_1.CustomersService, organization_service_1.OrganizationService, object_service_1.ObjectService, check_service_1.CheckService, sensor_service_1.SensorService],
        imports: [auth_module_1.AuthModule, prisma_module_1.PrismaModule],
        exports: [check_service_1.CheckService]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map