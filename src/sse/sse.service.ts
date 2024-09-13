import { Injectable, OnModuleInit } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SseService implements OnModuleInit {
  private eventsSubject = new Subject<{ data: string }>();
  private lastValuesSubject = new Subject<{ data: string }>();

  onModuleInit() {
    // Subscriptions for verification
    this.eventsSubject.subscribe((event) => {
      console.log('Event received ---', event);
    });

    this.lastValuesSubject.subscribe((event) => {
      console.log('Last values received ---', event);
    });
  }

  send(data: any) {
    // console.log("Data sent ---", data);
    const event = { data: JSON.stringify(data) };
    this.eventsSubject.next(event);
  }

  sendEvents(): Observable<{ data: string }> {
    return this.eventsSubject.asObservable();
  }

  sendLastValues(lastValuesForSend: {
    last_base_value: any;
    last_valueZ: any;
    last_valueY: any;
    sensor_id: any;
    last_valueX: any;
    base_zero: any;
    min_base: any;
    max_base: any;
  }) {
    console.log('Last values sent ---', lastValuesForSend);
    const event = { data: JSON.stringify(lastValuesForSend) };
    this.lastValuesSubject.next(event);
  }

  sendLastValuesStream(): Observable<{ data: string }> {
    return this.lastValuesSubject.asObservable();
  }
}
