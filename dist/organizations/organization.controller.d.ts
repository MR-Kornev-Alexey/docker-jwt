import { OrganizationService } from './organization.service';
export declare class OrganizationController {
    private readonly organizationService;
    constructor(organizationService: OrganizationService);
    initialMainOrganization(dto: any): Promise<{
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
        allOrganizations: {
            id: string;
            name: string;
            inn: string;
            address: string;
            directorName: string;
            organizationPhone: string;
            organizationEmail: string;
        }[];
        organization?: undefined;
    } | {
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
        organization: {
            id: string;
            name: string;
            inn: string;
            address: string;
            directorName: string;
            organizationPhone: string;
            organizationEmail: string;
        };
        allOrganizations?: undefined;
    } | {
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
        allOrganizations?: undefined;
        organization?: undefined;
    }>;
    createOrganisation(dto: any): Promise<{
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
        allOrganizations: {
            id: string;
            name: string;
            inn: string;
            address: string;
            directorName: string;
            organizationPhone: string;
            organizationEmail: string;
        }[];
    } | {
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
        allOrganizations?: undefined;
    }>;
    checkOrganisation(dto: any): Promise<{
        statusCode: import("@nestjs/common").HttpStatus;
        organization: {
            id: string;
            name: string;
            inn: string;
            address: string;
            directorName: string;
            organizationPhone: string;
            organizationEmail: string;
        };
    } | {
        statusCode: import("@nestjs/common").HttpStatus;
        organization: string;
    }>;
    getAllOrganisations(): Promise<{
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
        allOrganizations: {
            id: string;
            name: string;
            inn: string;
            address: string;
            directorName: string;
            organizationPhone: string;
            organizationEmail: string;
        }[];
    }>;
}
