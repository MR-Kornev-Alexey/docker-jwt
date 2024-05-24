import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService {
  private eventsSubject = new Subject<{ data: string }>();

  send(data: any) {
    const event = { data: JSON.stringify(data) };
    this.eventsSubject.next(event);
  }

  sendEvents(): Observable<{ data: string }> {
    return this.eventsSubject.asObservable();
  }
}
