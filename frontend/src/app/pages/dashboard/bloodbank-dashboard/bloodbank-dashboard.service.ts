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
 * Interface para estatísticas do banco de sangue
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

     /**
   * Processa dados brutos de doações e retorna estatísticas
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
   * Retorna total de doações
   */
  private getTotalDonations(donations: DonationData[]): number {
    return donations.length;
  }

  /**
   * Retorna doações agendadas (PENDING ou CONFIRMED)
   */
  private getScheduledDonations(donations: DonationData[]): number {
    return donations.filter(d => 
      d.status === 'PENDING' || d.status === 'CONFIRMED'
    ).length;
  }

  /**
   * Retorna doações completadas
   */
  private getCompletedDonations(donations: DonationData[]): number {
    return donations.filter(d => d.status === 'COMPLETED').length;
  }

  /**
   * Retorna doações canceladas
   */
  private getCancelledDonations(donations: DonationData[]): number {
    return donations.filter(d => d.status === 'CANCELLED').length;
  }

  /**
   * Processa doações ao longo do tempo (últimos 8 meses)
   */
  private getDonationsOverTime(donations: DonationData[]): Array<{ month: string; year: number; donations: number }> {
    const now = new Date();
    const donationsByMonth: Record<string, { month: string; year: number; donations: number }> = {};

    // Inicializa os últimos 8 meses
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      donationsByMonth[key] = {
        month: MONTHS[date.getMonth()],
        year: date.getFullYear(),
        donations: 0
      };
    }

    // Conta doações completadas por mês
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
   * Processa distribuição de tipos sanguíneos
   */
  private getBloodTypeDistribution(donations: DonationData[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    // Inicializa todos os tipos com zero
    BLOOD_TYPES.forEach(type => {
      distribution[type] = 0;
    });

    // Conta doações completadas por tipo sanguíneo
    donations
      .filter(d => d.status === 'COMPLETED' && d.bloodType)
      .forEach(donation => {
        const bloodType = donation.bloodType!;
        if (distribution.hasOwnProperty(bloodType)) {
          distribution[bloodType]++;
        }
      });

    return distribution;
  }

  /**
   * Calcula média de doações mensais
   */
  calculateAverageDonations(donationsOverTime: Array<{ donations: number }>): number {
    if (!donationsOverTime || donationsOverTime.length === 0) {
      return 0;
    }

    const total = donationsOverTime.reduce((sum, d) => sum + d.donations, 0);
    return Math.round(total / donationsOverTime.length);
  }

  /**
   * Formata dados para o gráfico de linha
   */
  formatLineChartData(donationsOverTime: Array<{ month: string; year: number; donations: number }>) {
    return {
      labels: donationsOverTime.map(item => `${item.month} de ${item.year}`),
      data: donationsOverTime.map(item => item.donations)
    };
  }

  /**
   * Formata dados para o gráfico de rosca (doughnut)
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