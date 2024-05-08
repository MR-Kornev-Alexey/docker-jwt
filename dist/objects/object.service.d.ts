import { HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ObjectFormInput } from "../types/objectFormInput";
import { CheckService } from '../check/check.service';
export declare class ObjectService {
    private dbService;
    private checkService;
    constructor(dbService: PrismaService, checkService: CheckService);
    getAllObjectsFromDb(): Promise<{
        statusCode: HttpStatus;
        message: string;
        allObjects: ({
            organization: {
                id: string;
                name: string;
                inn: string;
                address: string;
                directorName: string;
                organizationPhone: string;
                organizationEmail: string;
            };
            Sensor: {
                id: string;
                object_id: string;
                sensor_type: string;
                sensor_key: string;
                model: string;
                ip_address: string;
                designation: string;
                network_number: number;
                notation: string;
            }[];
        } & {
            id: string;
            organization_id: string;
            objectsType: import(".prisma/client").$Enums.ObjectsType;
            objectsMaterial: import(".prisma/client").$Enums.ObjectsMaterial;
            geo: string;
            name: string;
            address: string;
            notation: string;
        })[];
    }>;
    createNewObject(dto: ObjectFormInput): Promise<{
        statusCode: HttpStatus;
        message: string;
        allObjects: ({
            organization: {
                id: string;
                name: string;
                inn: string;
                address: string;
                directorName: string;
                organizationPhone: string;
                organizationEmail: string;
            };
            Sensor: {
                id: string;
                object_id: string;
                sensor_type: string;
                sensor_key: string;
                model: string;
                ip_address: string;
                designation: string;
                network_number: number;
                notation: string;
            }[];
        } & {
            id: string;
            organization_id: string;
            objectsType: import(".prisma/client").$Enums.ObjectsType;
            objectsMaterial: import(".prisma/client").$Enums.ObjectsMaterial;
            geo: string;
            name: string;
            address: string;
            notation: string;
        })[];
    } | {
        statusCode: HttpStatus;
        message: string;
    }>;
    getAllObject(dto: {
        email: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
        allObjects: ({
            organization: {
                id: string;
                name: string;
                inn: string;
                address: string;
                directorName: string;
                organizationPhone: string;
                organizationEmail: string;
            };
            Sensor: {
                id: string;
                object_id: string;
                sensor_type: string;
                sensor_key: string;
                model: string;
                ip_address: string;
                designation: string;
                network_number: number;
                notation: string;
            }[];
        } & {
            id: string;
            organization_id: string;
            objectsType: import(".prisma/client").$Enums.ObjectsType;
            objectsMaterial: import(".prisma/client").$Enums.ObjectsMaterial;
            geo: string;
            name: string;
            address: string;
            notation: string;
        })[];
    } | {
        statusCode: HttpStatus;
        message: string;
    }>;
}
