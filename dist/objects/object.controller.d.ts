import { ObjectService } from './object.service';
import { ObjectFormInput } from '../types/objectFormInput';
export declare class ObjectController {
    private readonly objectService;
    constructor(objectService: ObjectService);
    createObject(dto: ObjectFormInput): Promise<{
        statusCode: import("@nestjs/common").HttpStatus;
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
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
    getAllObject(dto: {
        email: string;
    }): Promise<{
        statusCode: import("@nestjs/common").HttpStatus;
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
        statusCode: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
}
