"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./jwt.strategy");
const jwt_config_1 = require("../jwt.config");
const unique_id_service_1 = require("../crypto/unique-id.service");
const bearer_middleware_1 = require("./bearer.middleware");
const profile_service_1 = require("../profile/profile.service");
const profile_controller_1 = require("../profile/profile.controller");
let AuthModule = class AuthModule {
    configure(consumer) {
        consumer
            .apply(bearer_middleware_1.BearerMiddleware)
            .forRoutes('profiles');
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({
                defaultStrategy: 'jwt',
                property: 'user',
                session: false,
            }),
            jwt_1.JwtModule.register({
                secret: jwt_config_1.JwtConfig.user_secret,
                signOptions: {
                    expiresIn: jwt_config_1.JwtConfig.user_expired,
                },
            }),
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, unique_id_service_1.UniqueIdService, profile_service_1.ProfileService],
        controllers: [auth_controller_1.AuthController, profile_controller_1.ProfileController]
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map