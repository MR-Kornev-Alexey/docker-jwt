import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {JwtService} from "@nestjs/jwt";
@Injectable()
export class ProfileService {
    constructor( private dbService: PrismaService) { }

    /**
     * Profile Service
     * @param dto
     * @returns
     */
    async getDataAboutUser (dto: any) {
        console.log(dto)
        let user = await this.dbService.m_User.findFirst({
            where: {
                email: dto.data
            }
        });
        console.log(user)
        if (!user) {
            throw new Error('Пользователь с таким email не найден');
        }
        const userData = await this.dbService.m_User.findFirst({
            where: {
                email: dto.data
            },
        });

        if (userData){
            return {
                statusCode: 200,
                user: userData
            };
        } else {
            return {
                statusCode: 404,
                user: "firstNoFind"
            };
        }

    }
}
