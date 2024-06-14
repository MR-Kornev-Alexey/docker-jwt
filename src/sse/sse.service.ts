import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private eventsSubject = new Subject<{ data: string }>();
  private lastValuesSubject = new Subject<{ data: string }>();

  send(data: any) {
    const event = { data: JSON.stringify(data) };
    this.eventsSubject.next(event);
  }

  sendEvents(): Observable<{ data: string }> {
    return this.eventsSubject.asObservable();
  }

  sendLastValues(lastValuesForSend: {
    last_base_value: any; last_valueZ: any; last_valueY: any; sensor_id: any; last_valueX: any, base_zero: any,
    min_base: any, max_base: any
  }) {
    const event = { data: JSON.stringify(lastValuesForSend) };
    this.lastValuesSubject.next(event);
  }

  sendLastValuesStream(): Observable<{ data: string }> {
    return this.lastValuesSubject.asObservable();
  }
}
