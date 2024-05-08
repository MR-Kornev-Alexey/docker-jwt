import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CheckService {
    constructor(private dbService: PrismaService) {}

    async checkUserAccess(email: string): Promise<boolean> {
        const checkUser = await this.dbService.m_User.findFirst({
            where: { email }
        });
        return checkUser?.role === "admin" || checkUser?.role === "supervisor";
    }
}
