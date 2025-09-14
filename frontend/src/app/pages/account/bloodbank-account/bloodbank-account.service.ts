import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Address } from '../../dashboard/dashboard.service';

export interface Campaign {
  id?: string;
  title: string;
  description: string;
  priority: string;
  active: boolean;
}

export interface BloodBank {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address?: Address;
  description?: string;
  website?: string;
  photoUrl?: string;
  campaigns?: Campaign[];
}

@Injectable({
  providedIn: 'root',
})
export class BloodBankAccountService {
  private readonly API = '/api/bloodbanks';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getBloodBank(): Observable<BloodBank> {
    const id = this.authService.getCurrentUserId();
    return this.http.get<BloodBank>(`${this.API}/${id}`);
  }

  updateBloodBank(data: Partial<BloodBank>): Observable<BloodBank> {
    const id = this.authService.getCurrentUserId();
    return this.http.put<BloodBank>(`${this.API}/${id}`, data);
  }

  addCampaign(campaign: Campaign): Observable<Campaign> {
    const id = this.authService.getCurrentUserId();
    return this.http.post<Campaign>(`${this.API}/${id}/campaigns`, campaign);
  }

  updateCampaign(campaign: Campaign): Observable<Campaign> {
    const id = this.authService.getCurrentUserId();
    if (!campaign.id) throw new Error('Campaign ID is required');
    return this.http.put<Campaign>(`${this.API}/${id}/campaigns/${campaign.id}`, campaign);
  }

  removeCampaign(campaignId: string): Observable<void> {
    const id = this.authService.getCurrentUserId();
    return this.http.delete<void>(`${this.API}/${id}/campaigns/${campaignId}`);
  }
}
