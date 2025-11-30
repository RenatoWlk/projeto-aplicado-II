import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationEventService {
  private refreshSubject = new Subject<void>();
  refresh$ = this.refreshSubject.asObservable();

  emitRefresh() {
    this.refreshSubject.next();
  }
}