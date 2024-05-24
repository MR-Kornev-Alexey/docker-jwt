import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import {CustomersService} from "./сustomers/сustomers.service";
import {CustomersController} from "./сustomers/сustomers.controller";
import {OrganizationController} from "./organizations/organization.controller";
import {OrganizationService} from "./organizations/organization.service";
import {ObjectController} from "./objects/object.controller"
import {ObjectService} from "./objects/object.service";
import {CheckService} from "./check/check.service";
import {SensorController} from "./sensors/sensor.controller";
import {SensorService} from "./sensors/sensor.service";
import { SocketClientService } from './socketClient/socketClient.service';
import { GetDataSensorService } from './socketClient/getDataSensor.service';
import { SocketClientModule } from './socketClient/socketClient.Module';
import { SseModule } from './sse/sse.module';
import { SensorsDataController } from './sensors-data/sensor-data.controller';
import { SensorsDataService } from './sensors-data/sensor-data.service';

@Module({
  controllers: [AppController, CustomersController, OrganizationController, ObjectController, SensorController, SensorsDataController],
  providers: [AppService, CustomersService, OrganizationService, ObjectService, CheckService, SensorService, SocketClientService, GetDataSensorService, SensorsDataService],
  imports: [AuthModule, PrismaModule, SocketClientModule, SseModule],
  exports: [CheckService]
})
export class AppModule {}
