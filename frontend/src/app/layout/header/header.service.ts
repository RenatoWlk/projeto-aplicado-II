import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  constructor(private http: HttpClient) {}

  sloganTrigger: EventEmitter<void> = new EventEmitter<void>();

  triggerSloganChange() {
    this.sloganTrigger.emit();
  }

  getNotificationsUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`/api/notifications/${userId}/unread-count`);
  }
}
