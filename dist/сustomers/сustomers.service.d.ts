import { HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
export declare class CustomersService {
    private dbService;
    constructor(dbService: PrismaService);
    private checkUserAccess;
    checkCustomersAddData(dto: any): Promise<{
        statusCode: HttpStatus;
        additionalData: {
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
    } | {
        statusCode: HttpStatus;
        additionalData?: undefined;
    }>;
    getCustomers(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        allUsers?: undefined;
    } | {
        statusCode: HttpStatus;
        allUsers: ({
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
        })[];
        message?: undefined;
    }>;
    checkSV(): Promise<{
        statusCode: HttpStatus;
    }>;
    deleteOneCustomer(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        allUsers: ({
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
        })[];
    } | {
        statusCode: HttpStatus;
        message: string;
        allUsers?: undefined;
    }>;
    createNewCustomer(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        allUsers?: undefined;
    } | {
        statusCode: HttpStatus;
        message: string;
        allUsers: ({
            organization: {
                id: string;
                name: string;
                inn: string;
                address: string;
                directorName: string;
                organizationPhone: string;
                organizationEmail: string;
            };
        } & {
            id: string;
            name: string;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.Role;
            organization_id: string;
            registration_status: import(".prisma/client").$Enums.RegistrationStatus;
            created_at: Date;
        })[];
    }>;
    getDataAboutOneCustomer(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        customer: {
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
    createCustomersAddData(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        customer?: undefined;
    } | {
        statusCode: HttpStatus;
        message: string;
        customer: {
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
    } | {
        statusCode: HttpStatus;
        message?: undefined;
        customer?: undefined;
    }>;
}
