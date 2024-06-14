import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseService } from './sse.service';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('events')
  sendEvents(): Observable<{ data: string }> {
    return this.sseService.sendEvents();
  }

  @Sse('last_value')
  sendLastValue(): Observable<{ data: string }> {
    return this.sseService.sendLastValuesStream();
  }
}
