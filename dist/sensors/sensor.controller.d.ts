/// <reference types="multer" />
import { HttpStatus } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { sensorFormInput } from '../types/sensorFormInput';
import { CheckService } from "../check/check.service";
export declare class SensorController {
    private readonly sensorService;
    private checkService;
    constructor(sensorService: SensorService, checkService: CheckService);
    setNewSensorToObject(dto: sensorFormInput): Promise<{
        statusCode: HttpStatus;
        message: string;
        allSensors: ({
            object: {
                id: string;
                organization_id: string;
                objectsType: import(".prisma/client").$Enums.ObjectsType;
                objectsMaterial: import(".prisma/client").$Enums.ObjectsMaterial;
                geo: string;
                name: string;
                address: string;
                notation: string;
            };
            additional_sensor_info: {
                id: number;
                sensor_id: string;
                factory_number: string;
                unit_of_measurement: string;
                installation_location: string;
                coefficient: number;
                base_value: number;
                last_value: number;
                error_information: string;
                additionalSensorInfoNotation: string;
            }[];
            sensor_operation_log: {
                id: number;
                sensor_id: string;
                passport_information: string;
                verification_information: string;
                warranty_Information: string;
                sensorOperationLogNotation: string;
            }[];
            files: {
                id: number;
                sensor_id: string;
                url: string;
            }[];
        } & {
            id: string;
            object_id: string;
            sensor_type: string;
            sensor_key: string;
            model: string;
            ip_address: string;
            designation: string;
            network_number: number;
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
        allSensors: ({
            object: {
                id: string;
                organization_id: string;
                objectsType: import(".prisma/client").$Enums.ObjectsType;
                objectsMaterial: import(".prisma/client").$Enums.ObjectsMaterial;
                geo: string;
                name: string;
                address: string;
                notation: string;
            };
            additional_sensor_info: {
                id: number;
                sensor_id: string;
                factory_number: string;
                unit_of_measurement: string;
                installation_location: string;
                coefficient: number;
                base_value: number;
                last_value: number;
                error_information: string;
                additionalSensorInfoNotation: string;
            }[];
            sensor_operation_log: {
                id: number;
                sensor_id: string;
                passport_information: string;
                verification_information: string;
                warranty_Information: string;
                sensorOperationLogNotation: string;
            }[];
            files: {
                id: number;
                sensor_id: string;
                url: string;
            }[];
        } & {
            id: string;
            object_id: string;
            sensor_type: string;
            sensor_key: string;
            model: string;
            ip_address: string;
            designation: string;
            network_number: number;
            notation: string;
        })[];
    } | {
        statusCode: HttpStatus;
        message: string;
    }>;
    getAllTypeOfSensors(dto: {
        email: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
        allSensors: {
            id: string;
            sensor_key: string;
            sensor_type: string;
            models: string[];
        }[];
    } | {
        statusCode: HttpStatus;
        message: string;
    }>;
    getAllDataAboutOneSensor(dto: {
        email: string;
        id: string;
    }): Promise<{
        statusCode: HttpStatus;
        message: string;
        oneSensor: {
            object: {
                id: string;
                organization_id: string;
                objectsType: import(".prisma/client").$Enums.ObjectsType;
                objectsMaterial: import(".prisma/client").$Enums.ObjectsMaterial;
                geo: string;
                name: string;
                address: string;
                notation: string;
            };
            additional_sensor_info: {
                id: number;
                sensor_id: string;
                factory_number: string;
                unit_of_measurement: string;
                installation_location: string;
                coefficient: number;
                base_value: number;
                last_value: number;
                error_information: string;
                additionalSensorInfoNotation: string;
            }[];
            sensor_operation_log: {
                id: number;
                sensor_id: string;
                passport_information: string;
                verification_information: string;
                warranty_Information: string;
                sensorOperationLogNotation: string;
            }[];
            files: {
                id: number;
                sensor_id: string;
                url: string;
            }[];
        } & {
            id: string;
            object_id: string;
            sensor_type: string;
            sensor_key: string;
            model: string;
            ip_address: string;
            designation: string;
            network_number: number;
            notation: string;
        };
    } | {
        statusCode: HttpStatus;
        message: string;
        oneSensor?: undefined;
    }>;
    initAllNewTypeSensor(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        allSensors: {
            statusCode: HttpStatus;
            message: string;
            allSensors: {
                id: string;
                sensor_key: string;
                sensor_type: string;
                models: string[];
            }[];
        };
    } | {
        statusCode: HttpStatus;
        message: string;
        allSensors?: undefined;
    }>;
    setAdditionalDataForSensor(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        oneSensor: {
            id: number;
            sensor_id: string;
            factory_number: string;
            unit_of_measurement: string;
            installation_location: string;
            coefficient: number;
            base_value: number;
            last_value: number;
            error_information: string;
            additionalSensorInfoNotation: string;
        };
    } | {
        statusCode: HttpStatus;
        message: string;
        oneSensor?: undefined;
    }>;
    setLogDataForSensor(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        oneSensor: {
            id: number;
            sensor_id: string;
            passport_information: string;
            verification_information: string;
            warranty_Information: string;
            sensorOperationLogNotation: string;
        };
    } | {
        statusCode: HttpStatus;
        message: string;
        oneSensor?: undefined;
    }>;
    createNewTypeSensor(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        allSensors: {
            id: string;
            sensor_key: string;
            sensor_type: string;
            models: string[];
        }[];
    } | {
        statusCode: HttpStatus;
        message: string;
    }>;
    changeIPForSensor(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        updatedSensor: {
            id: string;
            object_id: string;
            sensor_type: string;
            sensor_key: string;
            model: string;
            ip_address: string;
            designation: string;
            network_number: number;
            notation: string;
        };
    } | {
        statusCode: HttpStatus;
        message: string;
        updatedSensor?: undefined;
    }>;
    importNewSensorsToObject(dto: any): Promise<void>;
    deleteOneSensorFromApi(dto: any): Promise<{
        statusCode: HttpStatus;
        message: string;
    }>;
    uploadFile(body: any, file: Express.Multer.File): Promise<any>;
}
