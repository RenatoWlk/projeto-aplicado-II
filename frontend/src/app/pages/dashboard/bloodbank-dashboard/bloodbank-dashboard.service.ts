import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BloodType } from '../../../shared/app.enums';
import { DashboardConstants } from '../constants/dashboard.constants';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Address, Campaign } from '../dashboard.service';

interface DonationData {
  id: string;
  userId: string;
  bloodBankId: string;
  date: string;
  hour: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  bloodType?: string;
}

interface ProcessedStats {
  totalDonations: number;
  scheduledDonations: number;
  completedDonations: number;
  cancelledDonations: number;
  donationsOverTime: Array<{ month: string; year: number; donations: number }>;
  bloodTypeDistribution: Record<string, number>;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export interface DonationsOverTime {
  donations: number;
  month: 'Jan' | 'Fev' | 'Mar' | 'Abr' | 'Mai' | 'Jun' | 'Jul' | 'Ago' | 'Set' | 'Out' | 'Nov' | 'Dez';
  year: number;
}

/**
 * Blood bank statistics response model
 */
export interface BloodBankStats {
  totalDonations: number;
  scheduledDonations: number;
  donationsOverTime: DonationsOverTime[];
  bloodTypeBloodBags: {
    'A+'?: number;
    'A-'?: number;
    'B+'?: number;
    'B-'?: number;
    'AB+'?: number;
    'AB-'?: number;
    'O+'?: number;
    'O-'?: number;
    [key: string]: number | undefined;
  };
}

export interface NewCampaign {
  id: string;
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

  /**
   * Fetches aggregated statistics from the blood bank.
   */
  getBloodbankStats(bloodbankId: string): Observable<BloodBankStats> {
    return this.http.get<BloodBankStats>(`/api/bloodbanks/${bloodbankId}/stats`);
  }

  /**
   * Retrieves all campaigns created by a specific blood bank.
   */
  getBloodbankCampaigns(bloodbankId: string): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`/api/bloodbanks/${bloodbankId}/campaigns`);
  }

  /**
   * Creates a new campaign for the authenticated blood bank.
   */
  createCampaign(campaign: NewCampaign): Observable<Campaign> {
    campaign.bloodbankEmail = this.auth.getCurrentUserEmail();
    return this.http.post<NewCampaign>(DashboardConstants.CREATE_CAMPAIGN_ENDPOINT, campaign);
  }

  /**
   * Deletes a campaign for the authenticated blood bank.
   */
  deleteCampaign(campaignId: string) {
    const bloodBankId: string = this.auth.getCurrentUserId();
    return this.http.delete(`/api/bloodbanks/${bloodBankId}/campaigns/${campaignId}`);
  }

  /**
   * Processes raw donation data and extracts all computed statistics.
   */
  processStats(donations: DonationData[]): ProcessedStats {
    return {
      totalDonations: this.getTotalDonations(donations),
      scheduledDonations: this.getScheduledDonations(donations),
      completedDonations: this.getCompletedDonations(donations),
      cancelledDonations: this.getCancelledDonations(donations),
      donationsOverTime: this.getDonationsOverTime(donations),
      bloodTypeDistribution: this.getBloodTypeDistribution(donations)
    };
  }

  /**
   * Returns the total number of donations.
   */
  private getTotalDonations(donations: DonationData[]): number {
    return donations.length;
  }

  /**
   * Returns donations with status PENDING or CONFIRMED.
   */
  private getScheduledDonations(donations: DonationData[]): number {
    return donations.filter(d =>
      d.status === 'PENDING' || d.status === 'CONFIRMED'
    ).length;
  }

  /**
   * Returns the number of completed donations.
   */
  private getCompletedDonations(donations: DonationData[]): number {
    return donations.filter(d => d.status === 'COMPLETED').length;
  }

  /**
   * Returns the number of cancelled donations.
   */
  private getCancelledDonations(donations: DonationData[]): number {
    return donations.filter(d => d.status === 'CANCELLED').length;
  }

  /**
   * Computes donation counts for the last 8 months, grouped by month.
   */
  private getDonationsOverTime(donations: DonationData[]): Array<{ month: string; year: number; donations: number }> {
    const now = new Date();
    const donationsByMonth: Record<string, { month: string; year: number; donations: number }> = {};

    // Initialize last 8 months
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      donationsByMonth[key] = {
        month: MONTHS[date.getMonth()],
        year: date.getFullYear(),
        donations: 0
      };
    }

    // Count completed donations per month
    donations
      .filter(d => d.status === 'COMPLETED')
      .forEach(donation => {
        const donationDate = new Date(donation.date);
        const key = `${donationDate.getFullYear()}-${donationDate.getMonth()}`;

        if (donationsByMonth[key]) {
          donationsByMonth[key].donations++;
        }
      });

    return Object.values(donationsByMonth);
  }

  /**
   * Computes distribution of completed donations per blood type.
   */
  private getBloodTypeDistribution(donations: DonationData[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    // Initialize all blood types
    BLOOD_TYPES.forEach(type => {
      distribution[type] = 0;
    });

    // Count completed donations by blood type
    donations.filter(d => d.status === 'COMPLETED' && d.bloodType).forEach(donation => {
      const bloodType = donation.bloodType!;
      if (distribution.hasOwnProperty(bloodType)) {
        distribution[bloodType]++;
      }
    });

    return distribution;
  }

  /**
   * Calculates the average donations per month over a period.
   */
  calculateAverageDonations(donationsOverTime: Array<{ donations: number }>): number {
    if (!donationsOverTime || donationsOverTime.length === 0) {
      return 0;
    }

    const total = donationsOverTime.reduce((sum, d) => sum + d.donations, 0);
    return Math.round(total / donationsOverTime.length);
  }

  /**
   * Formats data for the line chart component.
   */
  formatLineChartData(donationsOverTime: Array<{ month: string; year: number; donations: number }>) {
    return {
      labels: donationsOverTime.map(item => `${item.month} de ${item.year}`),
      data: donationsOverTime.map(item => item.donations)
    };
  }

  /**
   * Formats data for the doughnut chart component.
   */
  formatDoughnutChartData(
    bloodTypeDistribution: Record<string, number>,
    colors: Record<string, string>
  ) {
    const labels = BLOOD_TYPES;
    const data = labels.map(label => bloodTypeDistribution[label] || 0);
    const hasData = data.some(value => value > 0);

    return {
      labels: hasData ? labels : ['Sem dados'],
      datasets: [{
        label: 'Doações por tipo sanguíneo',
        data: hasData ? data : [1],
        backgroundColor: hasData ? labels.map(label => colors[label]) : ['#cccccc']
      }]
    };
  }
}