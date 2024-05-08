import { PrismaService } from 'src/prisma/prisma.service';
export declare class ProfileService {
    private dbService;
    constructor(dbService: PrismaService);
    getDataAboutUser(dto: any): Promise<{
        statusCode: number;
        user: {
            id: string;
            name: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            organization_id: string;
            registration_status: import(".prisma/client").$Enums.RegistrationStatus;
            created_at: Date;
        };
    } | {
        statusCode: number;
        user: string;
    }>;
}
