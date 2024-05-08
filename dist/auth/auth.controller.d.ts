import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UniqueIdService } from '../crypto/unique-id.service';
export declare class AuthController {
    private authService;
    private uniqueIdService;
    constructor(authService: AuthService, uniqueIdService: UniqueIdService);
    register(dto: RegisterDto): Promise<{
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
}
