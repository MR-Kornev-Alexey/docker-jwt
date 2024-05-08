import { PrismaService } from 'src/prisma/prisma.service';
export declare class CheckService {
    private dbService;
    constructor(dbService: PrismaService);
    checkUserAccess(email: string): Promise<boolean>;
}
