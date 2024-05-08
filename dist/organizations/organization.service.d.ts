import { HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckService } from '../check/check.service';
export declare class OrganizationService {
    private dbService;
    private checkService;
    constructor(dbService: PrismaService, checkService: CheckService);
    private findOrganizationByInn;
    initialNewMainOrganization(dto: any): Promise<{
        statusCode: HttpStatus;
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
        statusCode: HttpStatus;
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
        statusCode: HttpStatus;
        message: string;
        allOrganizations?: undefined;
        organization?: undefined;
    }>;
    createNewOrganization(dto: any): Promise<{
        statusCode: HttpStatus;
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
        statusCode: HttpStatus;
        message: string;
        allOrganizations?: undefined;
    }>;
    checkOrganization(dto: any): Promise<{
        statusCode: HttpStatus;
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
        statusCode: HttpStatus;
        organization: string;
    }>;
    getAllOrganizationsApi(): Promise<{
        statusCode: HttpStatus;
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
