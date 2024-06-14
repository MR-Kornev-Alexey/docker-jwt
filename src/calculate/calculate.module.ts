import { Module } from '@nestjs/common';
import { CalculateService } from './calculate.service';
import { SseModule } from '../sse/sse.module';

@Module({
  providers: [CalculateService],
  exports: [CalculateService],
  imports: [SseModule],
})
export class CalculateModule {}
