interface AdditionalSensorInfo {
  missedConsecutive: number;
}

interface RequestSensorInfo {
  id:  number,
  counter: number;
}

interface User {
  telegramId: number;  // Changed from string to number
  telegramInfo: boolean;  // Changed from string to boolean
}

interface Organization {
  id: string;
  users: User[];
}

interface ObjectDetails {
  id: string,
  name: string;
  address: string;
  organization: Organization;
}

export interface SensorDetails {
  model: string;
  designation: string;
  object_id: string;
  additional_sensor_info?: AdditionalSensorInfo[]; // Changed to an array
  requestSensorInfo?: RequestSensorInfo[]; // Changed to an array
  object?: ObjectDetails;
}