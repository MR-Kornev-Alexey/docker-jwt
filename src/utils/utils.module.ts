// src/utils/utils.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ensure PrismaService is imported
import { SensorUtilsService } from './sensor-utils.service';
import { TelegramModule } from '../telegram/telegram.module';

@Module({
  providers: [PrismaService, SensorUtilsService],
  exports: [SensorUtilsService],
  imports: [TelegramModule]// Exporting the service for use in other modules
})
export class UtilsModule {}
