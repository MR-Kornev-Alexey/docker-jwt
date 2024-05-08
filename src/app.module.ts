import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import {CustomersService} from "./сustomers/сustomers.service";
import {CustomersController} from "./сustomers/сustomers.controller";
import {OrganizationController} from "./organizations/organization.controller";
import {OrganizationService} from "./organizations/organization.service";
import {ObjectController} from "./objects/object.controller"
import {ObjectService} from "./objects/object.service";
import {CheckService} from "./check/check.service";
import {SensorController} from "./sensors/sensor.controller";
import {SensorService} from "./sensors/sensor.service";

@Module({
  controllers: [AppController, CustomersController, OrganizationController, ObjectController, SensorController],
  providers: [AppService, CustomersService, OrganizationService, ObjectService, CheckService, SensorService],
  imports: [AuthModule, PrismaModule],
  exports: [CheckService]
})
export class AppModule {}
