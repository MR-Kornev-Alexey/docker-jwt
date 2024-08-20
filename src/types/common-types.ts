// appVisit.ts
export interface AppVisit {
  id: string;
  date: Date;
  user_id: string;
  user: MUser;
}

// m_User.ts
export interface MUser {
  id: string;
  name: string;
  email: string;
  telegramId?: number;
  telegramInfo?: boolean;
  password: string;
  role: Role;
  organization_id: string;
  organization: MOrganisation;
  registration_status: RegistrationStatus;
  created_at: Date;
  additionalUserInfo: MAdditionalUserInfo[];
  appVisit: AppVisit[];
}

// m_AdditionalUserInfo.ts
export interface MAdditionalUserInfo {
  user_id: string;
  user: MUser;
  firstName?: string;
  surName?: string;
  phone?: string;
  telegram?: string;
  position?: string;
  created_at: Date;
  updated_at?: Date;
}

// m_Organisation.ts
export interface MOrganisation {
  id: string;
  name: string;
  inn: string;
  address: string;
  directorName: string;
  organizationPhone: string;
  organizationEmail: string;
  users: MUser[];
  objects: MObject[];
}

// m_Object.ts
export interface MObject {
  id: string;
  organization_id: string;
  organization: MOrganisation;
  objectsType: ObjectsType;
  objectsMaterial: ObjectsMaterial;
  geo: string;
  name: string;
  address: string;
  notation: string;
  set_null: boolean;
  periodicity: number;
  sensors: NewSensor[];
  notifications: MNotifications[];
  Sensor: NewSensor[];
}

export interface NewSensor {
  id: string;
  object_id: string;
  object: MObject;
  sensor_type: string;
  sensor_key: string;
  model: string;
  ip_address?: string;
  designation?: string;
  network_number: number;
  notation?: string;
  run: boolean;
  error_information: SensorErrorsLog[];
  additional_sensor_info: AdditionalSensorInfo[];
  sensor_operation_log: SensorOperationLog[];
  files: SensorFile[];
  dataFromSensor: DataFromSensor[];
  requestSensorInfo: RequestSensorInfo[];
}

// additionalSensorInfo.ts
export interface AdditionalSensorInfo {
  id: number;
  sensor_id: string;
  sensor: NewSensor;
  factory_number?: string;
  unit_of_measurement?: string;
  installation_location?: string;
  coefficient?: number;
  limitValue?: number;
  emissionsQuantity?: number;
  errorsQuantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  missedConsecutive?: number;
  additionalSensorInfoNotation?: string;
}

// sensorOperationLog.ts
export interface SensorOperationLog {
  id: number;
  sensor_id: string;
  sensor: NewSensor;
  passport_information?: string;
  verification_information?: string;
  warranty_information?: string;
  sensorOperationLogNotation?: string;
}

// sensorErrorsLog.ts
export interface SensorErrorsLog {
  id: number;
  sensor_id: string;
  sensor: NewSensor;
  error_information?: string;
  created_at: Date;
}

// commonErrorsLog.ts
export interface CommonErrorsLog {
  id: number;
  counter_error?: number;
  error_information?: string;
  created_at: Date;
}

// SensorFile.ts
export interface SensorFile {
  id: number;
  sensor_id: string;
  sensor: NewSensor;
  url: string;
}

// requestSensorInfo.ts
export interface RequestSensorInfo {
  id: number;
  sensor_id: string;
  sensor: NewSensor;
  periodicity: number;
  request_code?: string;
  counter?: number;
  alarm_counter?: number;
  over_counter?: number;
  under_counter?: number;
  last_base_value?: number;
  last_valueX?: number;
  last_valueY?: number;
  last_valueZ?: number;
  base_zero?: number;
  min_base?: number;
  max_base?: number;
  warning: boolean;
}

// dataFromSensor.ts
export interface DataFromSensor {
  id: number;
  sensor_id: string;
  sensor: NewSensor;
  request_code: string;
  answer_code: string;
  created_at: Date;
}

// m_notifications.ts
export interface MNotifications {
  id: number;
  object_id: string;
  object: MObject;
  information: string;
  created_at: Date;
}

// type_Sensor.ts
export interface TypeSensor {
  id: string;
  sensor_key: string;
  sensor_type: string;
  models: string[];
}

// Enums.ts
export enum Role {
  Customer = "customer",
  Dispatcher = "dispatcher",
  Admin = "admin",
  Supervisor = "supervisor",
}

export enum RegistrationStatus {
  Reset = "RESET",
  Completed = "COMPLETED",
  NotCompleted = "NOT_COMPLETED",
}

export enum ObjectsType {
  Tower = "tower",
  Bridge = "bridge",
  Building = "building",
  Footbridge = "footbridge",
  Overpass = "overpass",
}

export enum ObjectsMaterial {
  Steel = "steel",
  Ferroconcrete = "ferroconcrete",
  Wood = "wood",
  Mixed = "mixed",
}
