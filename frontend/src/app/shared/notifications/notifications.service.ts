import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationDto } from './notifications.model';

export interface ActivateNotification {
  userId?: string;
  baseId: string;
  hoursToExpire: number;
}

export interface ActivateNotificationAll {
  baseId: string;
  hoursToExpire: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly baseUrl = '/api/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(userId: string): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.baseUrl}/${userId}`);
  }

  getUnreadCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${userId}/unread-count`);
  }

  activateForUser(userId: string, baseId: string, hoursToExpire: number = 24): Observable<void> {
    const payload = { userId: userId, baseId: baseId, hoursToExpire: hoursToExpire };
    return this.http.post<void>(`${this.baseUrl}/activate-user`, payload);
  }

  activateForAll(baseId: string, hoursToExpire: number = 24): Observable<ActivateNotificationAll> {
    const payload: ActivateNotificationAll = { baseId: baseId, hoursToExpire: hoursToExpire };
    return this.http.post<ActivateNotificationAll>(`${this.baseUrl}/activate-all`, payload);
  }

  markRead(userId: string, baseId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/mark-read/${baseId}`, null);
  }

  markAllRead(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/mark-all-read`, null);
  }
}
