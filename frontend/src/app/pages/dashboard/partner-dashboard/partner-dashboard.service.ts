import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Reward } from '../../rewards/rewards.service';
import { Observable } from 'rxjs';
import { DashboardConstants } from '../constants/dashboard.constants';
import { Offer } from '../dashboard.service';

export interface NewOffer {
    partnerEmail: string;
    partnerName: string;
    title: string;
    body: string;
    validUntil: Date;
    discountPercentage: number;
}

@Injectable({
    providedIn: 'root'
})
export class PartnerDashboardService {
    constructor(private http: HttpClient, private auth: AuthService) {}

    getPartnerOffers(partnerId: string): Observable<Offer[]> {
        return this.http.get<Offer[]>(`/api/partners/${partnerId}/offers`);
    }

    getPartnerRewards(partnerId: string): Observable<Reward[]> {
        return this.http.get<Reward[]>(`/api/partners/${partnerId}/rewards`);
    }

    createOffer(offer: NewOffer): Observable<NewOffer> {
        offer.partnerEmail = this.auth.getCurrentUserEmail();
        offer.partnerName = this.auth.getCurrentUserName();
        return this.http.post<NewOffer>(DashboardConstants.CREATE_OFFER_ENDPOINT, offer);
    }

    createReward(reward: Reward): Observable<any> {
        reward.partnerId = this.auth.getCurrentUserId();
        return this.http.post<Reward>(DashboardConstants.CREATE_REWARD_ENDPOINT, reward);
    }

    deleteOffer(id: string) {
        const partnerId: string = this.auth.getCurrentUserId();
        return this.http.delete(`/api/partners/${partnerId}/offers/${id}`);
    }

    deleteReward(id: string) {
        return this.http.delete(`/api/rewards/${id}`);
    }
}