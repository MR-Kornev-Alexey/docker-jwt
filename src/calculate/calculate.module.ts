import { Module } from '@nestjs/common';
import { CalculateService } from './calculate.service';
import { SseModule } from '../sse/sse.module';
import { TelegramModule } from '../telegram/telegram.module';
import { UtilsModule } from '../utils/utils.module';

@Module({
  providers: [CalculateService],
  exports: [CalculateService],
  imports: [SseModule, TelegramModule, UtilsModule],
})
export class CalculateModule {}
