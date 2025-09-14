import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BloodType } from '../../../shared/app.enums';
import { DashboardConstants } from '../constants/dashboard.constants';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Address, Campaign } from '../dashboard.service';

export interface DonationsOverTime {
    donations: number;
    month: 'Jan' | 'Fev' | 'Mar' | 'Abr' | 'Mai' | 'Jun' | 'Jul' | 'Ago' | 'Set' | 'Out' | 'Nov' | 'Dez';
    year: number;
}

export interface BloodBankStats {
    totalDonations: number;
    scheduledDonations: number;
    donationsOverTime: DonationsOverTime[];
    bloodTypeBloodBags: {
        [key in keyof typeof BloodType]: number;
    };
}

export interface NewCampaign {
    bloodbankEmail: string;
    title: string;
    body: string;
    startDate: Date;
    endDate: Date;
    location: Address;
    phone: string;
}

@Injectable({
    providedIn: 'root'
})
export class BloodBankDashboardService {
    constructor(private http: HttpClient, private auth: AuthService) {}

    getBloodbankStats(bloodbankId: string): Observable<BloodBankStats> {
        return this.http.get<BloodBankStats>(`/api/bloodbanks/${bloodbankId}/stats`);
    }

    getBloodbankCampaigns(bloodbankId: string): Observable<Campaign[]> {
        return this.http.get<Campaign[]>(`/api/bloodbanks/${bloodbankId}/campaigns`);
    }

    createCampaign(campaign: NewCampaign): Observable<Campaign> {
        campaign.bloodbankEmail = this.auth.getCurrentUserEmail();
        return this.http.post<NewCampaign>(DashboardConstants.CREATE_CAMPAIGN_ENDPOINT, campaign);
    }
}