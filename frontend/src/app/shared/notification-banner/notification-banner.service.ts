import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationData {
  message: string;
  type: 'success' | 'warning' | 'error';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationBannerService {
  private notificationSubject = new Subject<NotificationData>();

  notification$ = this.notificationSubject.asObservable();

  show(message: string, type: 'success' | 'warning' | 'error' = 'success', duration: number = 3000) {
    this.notificationSubject.next({ message, type, duration });
  }
}
