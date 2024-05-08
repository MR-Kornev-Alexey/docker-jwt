import {HttpException, HttpStatus, Injectable, UseGuards} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { omit } from 'lodash';
import { compare } from 'bcrypt';
import { JwtConfig } from 'src/jwt.config';

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private dbService: PrismaService) { }

    private async findOrganisationsId(inn: string) {
        const findOrganisation = await this.dbService.m_Organisation.findFirst({
            where: {inn: inn}
        });
        return findOrganisation.id
    }
    /**
     * Register Service
     * @param dto 
     * @returns 
     */
    async register(dto: any) {
        let user = await this.dbService.m_User.findFirst({
            where: {
                email: dto.email
            }
        });

        if (user) {
            throw new HttpException('User Exists', HttpStatus.BAD_REQUEST);
        }

        // Fetch the organisation ID
        const organizationId = await this.findOrganisationsId(dto.organizationInn);

        // Remove organizationInn from dto
        delete dto.organizationInn;

        // Modify dto
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

        throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }


    /**
     * Login Service
     * @param dto 
     * @returns 
     */
    async login(dto: LoginDto) {

        let user = await this.dbService.m_User.findFirst({
            where: { email: dto.email },
            include: {
                organization: true,
                additionalUserInfo: true
            }
        });

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        let checkPassword = await compare(dto.password, user.password);
        if (!checkPassword) {
            throw new HttpException('Credential Incorrect', HttpStatus.UNAUTHORIZED);
        }
        // return await this.generateJwt(user.id, user.email, user, JwtConfig.user_secret, JwtConfig.user_expired);
        return {
            statusCode: 200,
            message: 'Успешная аутентификация',
            user: user
        };
    }

    /**
     * Generate JWT
     * @param userId 
     * @param email 
     * @param user 
     * @param secret 
     * @param expired 
     * @returns 
     */
    async generateJwt(userId: any, email: string, user: any, secret: any, expired = JwtConfig.user_expired) {
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
            user: omit(user, ['password','created_at','updated_at'])
        };
    }

}
