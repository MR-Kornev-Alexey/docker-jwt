/// <reference types="lodash" />
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private jwtService;
    private dbService;
    constructor(jwtService: JwtService, dbService: PrismaService);
    private findOrganisationsId;
    register(dto: any): Promise<{
        statusCode: number;
        message: string;
        user: {
            organization: {
                id: string;
                name: string;
                inn: string;
                address: string;
                directorName: string;
                organizationPhone: string;
                organizationEmail: string;
            };
            additionalUserInfo: {
                user_id: string;
                firstName: string;
                surName: string;
                phone: string;
                telegram: string;
                position: string;
                created_at: Date;
                updated_at: Date;
            }[];
        } & {
            id: string;
            name: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            organization_id: string;
            registration_status: import(".prisma/client").$Enums.RegistrationStatus;
            created_at: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        statusCode: number;
        message: string;
        user: {
            organization: {
                id: string;
                name: string;
                inn: string;
                address: string;
                directorName: string;
                organizationPhone: string;
                organizationEmail: string;
            };
            additionalUserInfo: {
                user_id: string;
                firstName: string;
                surName: string;
                phone: string;
                telegram: string;
                position: string;
                created_at: Date;
                updated_at: Date;
            }[];
        } & {
            id: string;
            name: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            organization_id: string;
            registration_status: import(".prisma/client").$Enums.RegistrationStatus;
            created_at: Date;
        };
    }>;
    generateJwt(userId: any, email: string, user: any, secret: any, expired?: string): Promise<{
        statusCode: number;
        accessToken: string;
        user: import("lodash").Omit<any, "password" | "created_at" | "updated_at">;
    }>;
}
