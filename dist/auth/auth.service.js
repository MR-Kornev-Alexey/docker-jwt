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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const lodash_1 = require("lodash");
const bcrypt_1 = require("bcrypt");
const jwt_config_1 = require("../jwt.config");
let AuthService = class AuthService {
    constructor(jwtService, dbService) {
        this.jwtService = jwtService;
        this.dbService = dbService;
    }
    async findOrganisationsId(inn) {
        const findOrganisation = await this.dbService.m_Organisation.findFirst({
            where: { inn: inn }
        });
        return findOrganisation.id;
    }
    async register(dto) {
        let user = await this.dbService.m_User.findFirst({
            where: {
                email: dto.email
            }
        });
        if (user) {
            throw new common_1.HttpException('User Exists', common_1.HttpStatus.BAD_REQUEST);
        }
        const organizationId = await this.findOrganisationsId(dto.organizationInn);
        delete dto.organizationInn;
        dto.role = "customer";
        dto.registration_status = "NOT_COMPLETED";
        dto.organization_id = organizationId;
        let createUser = await this.dbService.m_User.create({
            data: dto
        });
        if (createUser) {
            let user = await this.dbService.m_User.findFirst({
                where: { email: dto.email },
                include: {
                    organization: true,
                    additionalUserInfo: true
                }
            });
            return {
                statusCode: 200,
                message: 'Успешная регистрация',
                user: user
            };
        }
        throw new common_1.HttpException('Bad request', common_1.HttpStatus.BAD_REQUEST);
    }
    async login(dto) {
        let user = await this.dbService.m_User.findFirst({
            where: { email: dto.email },
            include: {
                organization: true,
                additionalUserInfo: true
            }
        });
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        let checkPassword = await (0, bcrypt_1.compare)(dto.password, user.password);
        if (!checkPassword) {
            throw new common_1.HttpException('Credential Incorrect', common_1.HttpStatus.UNAUTHORIZED);
        }
        return {
            statusCode: 200,
            message: 'Успешная аутентификация',
            user: user
        };
    }
    async generateJwt(userId, email, user, secret, expired = jwt_config_1.JwtConfig.user_expired) {
        let accessToken = this.jwtService.sign({
            sub: userId,
            email,
            name: user.first_name + ' ' + user.last_name
        }, {
            expiresIn: expired,
            secret
        });
        return {
            statusCode: 200,
            accessToken: accessToken,
            user: (0, lodash_1.omit)(user, ['password', 'created_at', 'updated_at'])
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map