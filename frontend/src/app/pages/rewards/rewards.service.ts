import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';
import { Partner } from '../account/partner-account/partner-account.service';

export interface Reward {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  description: string;
  requiredPoints: number;
  stock: number;
  redeemed?: boolean;
}

export interface RewardsResponse {
  userPoints: number;
  rewards: Reward[];
}

export interface UserRewards {
  rewardsIds: string[];
}

export interface RedeemPayload {
  rewardId: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  private readonly BASE_URL = '/api/rewards';

  constructor(private http: HttpClient, private auth: AuthService) {}

  getRewards(): Observable<RewardsResponse | Reward[]> {
    const userId = this.auth.getCurrentUserId();
    return this.http.get<RewardsResponse | Reward[]>(`${this.BASE_URL}/${userId}`);
  }

  redeemReward(rewardId: string): Observable<void> {
    const payload: RedeemPayload = {
      rewardId,
      userId: this.auth.getCurrentUserId()
    };
    return this.http.post<void>(`${this.BASE_URL}/redeem`, payload);
  }
}
