import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/services/auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AchievementsService {
  private readonly BASE_URL = '/api/achievements';

  constructor(private http: HttpClient, private auth: AuthService) {}

  unlockScrtAchievement(): Observable<void> {
    const userId = this.auth.getCurrentUserId();
    return this.http.post<void>(`${this.BASE_URL}/unlock-scrt/${userId}`, null);
  }
}
