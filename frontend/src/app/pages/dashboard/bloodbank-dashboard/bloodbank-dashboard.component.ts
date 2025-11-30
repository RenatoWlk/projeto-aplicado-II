import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Campaign } from '../dashboard.service';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { FormCreateItemComponent } from '../../../shared/form-create-item/form-create-item.component';
import { PreloaderComponent } from "../../../shared/preloader/preloader.component";
import { DonationService } from '../../calendar/donator-calendar/donator-calendar.service';
import { NotificationBannerService } from '../../../shared/notification-banner/notification-banner.service';
import { BloodBankDashboardService, BloodBankStats, DonationsOverTime } from './bloodbank-dashboard.service';
import { NotificationService } from '../../../shared/notifications/notifications.service';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const;
type MonthType = typeof MONTHS[number];

@Component({
  selector: 'bloodbank-dashboard',
  imports: [CommonModule, BaseChartDirective, ModalComponent, FormCreateItemComponent, PreloaderComponent],
  templateUrl: './bloodbank-dashboard.component.html',
  styleUrl: './bloodbank-dashboard.component.scss'
})
export class BloodbankDashboardComponent implements OnInit {

  // Dashboard data
  bloodbankStats: BloodBankStats = {
    totalDonations: 0,
    scheduledDonations: 0,
    donationsOverTime: [],
    bloodTypeBloodBags: {}
  } as any;

  bloodbankCampaigns: Campaign[] = [];
  private bloodbankId: string = "";
  isCampaignModalOpen: boolean = false;
  averageDonation: number = 0;

  // Preloaders
  isLoadingBloodbankStats: boolean = true;
  isLoadingBloodbankCampaigns: boolean = true;

  // ==========================================
  // DONATIONS OVER TIME CHART CONFIG
  // ==========================================
  donationsOverTimeChartData = [{
    data: [] as number[],
    label: 'Doações Completadas',
    borderColor: '',
    backgroundColor: '',
    tension: 0,
    fill: true,
    pointBackgroundColor: '',
    pointBorderColor: '',
    pointHoverBackgroundColor: '',
    pointHoverBorderColor: '',
    pointRadius: 0,
    pointHoverRadius: 0
  }];

  donationsOverTimeChartLabels: string[] = [];
  donationsOverTimeChartType = 'line' as keyof ChartTypeRegistry;

  public donationsOverTimeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: 0 },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 14, family: 'Poppins' }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: 14, family: 'Poppins' }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 18, weight: 'bold' }
        }
      }
    }
  };

  // ==========================================
  // BLOOD TYPE CHART CONFIG
  // ==========================================
  bloodTypeChartType = 'doughnut' as keyof ChartTypeRegistry;

  bloodColors: Record<string, string> = {
    'A+': '#75ee75', 'A-': '#1b6e1b',
    'B+': '#5dc2e4', 'B-': '#1a81e9',
    'AB+': '#fff599', 'AB-': '#ffe139',
    'O+': '#ff6262', 'O-': '#ff2929'
  };

  bloodTypeChartData = {
    labels: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'],
    datasets: [{
      label: 'Doações por tipo sanguíneo',
      data: [] as number[],
      backgroundColor: [
        this.bloodColors['A+'], this.bloodColors['A-'],
        this.bloodColors['B+'], this.bloodColors['B-'],
        this.bloodColors['AB+'], this.bloodColors['AB-'],
        this.bloodColors['O+'], this.bloodColors['O-']
      ]
    }]
  };

  public bloodTypeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 20, family: 'Poppins' }
        }
      },
      tooltip: {
        bodyFont: { size: 15 },
        titleFont: { size: 17 }
      }
    }
  };

  constructor(
    private bbDashboardService: BloodBankDashboardService,
    private authService: AuthService,
    private donationService: DonationService,
    private notificationBannerService: NotificationBannerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.bloodbankId = this.authService.getCurrentUserId();
    this.loadCampaigns();
    this.loadDonations();
  }

  // ==========================================
  // LOAD DONATIONS
  // ==========================================
  async loadDonations(): Promise<void> {
    this.donationService.getBloodBankDonations(this.bloodbankId).subscribe({
      next: (donations: any[]) => {
        this.processStats(donations);
        this.updateCharts();
        this.isLoadingBloodbankStats = false;
      },
      error: (error) => {
        console.error('Failed to load donations:', error);
        this.notificationBannerService.show('Erro ao carregar doações', 'error');
        this.isLoadingBloodbankStats = false;
      }
    });
  }

  // ==========================================
  // PROCESS STATISTICS
  // ==========================================
  private processStats(donations: any[]): void {
    const completed = donations.filter(d => d.status === 'COMPLETED');
    const scheduled = donations.filter(d =>
      d.status === 'PENDING' || d.status === 'CONFIRMED'
    );

    const donationsOverTime = this.processDonationsOverTime(completed);
    const bloodTypeDistribution = this.processBloodTypeDistribution(completed);

    this.bloodbankStats = {
      totalDonations: completed.length,
      scheduledDonations: scheduled.length,
      donationsOverTime,
      bloodTypeBloodBags: bloodTypeDistribution as any
    };

    this.averageDonation = this.calculateAverage(donationsOverTime);
  }

  private processDonationsOverTime(completed: any[]): DonationsOverTime[] {
    const now = new Date();
    const result: DonationsOverTime[] = [];

    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = date.getMonth();

      const monthData: DonationsOverTime = {
        month: MONTHS[monthIndex],
        year: date.getFullYear(),
        donations: 0
      };

      completed.forEach(donation => {
        const donationDate = new Date(donation.date);

        if (
          donationDate.getFullYear() === date.getFullYear() &&
          donationDate.getMonth() === date.getMonth()
        ) {
          monthData.donations++;
        }
      });

      result.push(monthData);
    }

    return result;
  }

  private processBloodTypeDistribution(completed: any[]): Record<string, number> {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const distribution: Record<string, number> = {};

    bloodTypes.forEach(t => distribution[t] = 0);

    completed.forEach(donation => {
      if (donation.bloodType && distribution.hasOwnProperty(donation.bloodType)) {
        distribution[donation.bloodType]++;
      }
    });

    return distribution;
  }

  private calculateAverage(data: DonationsOverTime[]): number {
    if (!data || data.length === 0) return 0;

    const total = data.reduce((sum, d) => sum + d.donations, 0);
    return Math.round(total / data.length);
  }

  private updateCharts(): void {
    this.updateDonationsOverTimeChart();
    this.updateBloodTypeChart();
  }

  private updateDonationsOverTimeChart(): void {
    const data = this.bloodbankStats.donationsOverTime || [];

    this.donationsOverTimeChartLabels = data.map(
      item => `${item.month} de ${item.year}`
    );

    this.donationsOverTimeChartData = [{
      data: data.map(item => item.donations),
      label: 'Doações Completadas',
      borderColor: '#28a745',
      backgroundColor: '#68af79ff',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#28a745',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#28a745',
      pointRadius: 4,
      pointHoverRadius: 6
    }];
  }

  private updateBloodTypeChart(): void {
    const distribution = this.bloodbankStats.bloodTypeBloodBags || {};
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const data = bloodTypes.map(type => distribution[type] || 0);
    const hasData = data.some(v => v > 0);

    this.bloodTypeChartData = {
      labels: hasData ? bloodTypes : ['Sem dados'],
      datasets: [{
        label: 'Doações por tipo sanguíneo',
        data: hasData ? data : [1],
        backgroundColor: hasData
          ? bloodTypes.map(type => this.bloodColors[type])
          : ['#cccccc']
      }]
    };
  }

  // ==========================================
  // CAMPAIGNS
  // ==========================================
  private loadCampaigns(): void {
    this.bbDashboardService.getBloodbankCampaigns(this.bloodbankId).subscribe({
      next: (campaigns: Campaign[]) => {
        this.bloodbankCampaigns = campaigns;
        this.isLoadingBloodbankCampaigns = false;
      },
      error: () => {
        this.notificationBannerService.show('Erro ao carregar campanhas', 'error');
        this.isLoadingBloodbankCampaigns = false;
      }
    });
  }

  createNewCampaign(data: any): void {
    this.isCampaignModalOpen = false;

    this.bbDashboardService.createCampaign(data).subscribe({
      next: () => {
        this.loadCampaigns();
        this.notificationService.activateForAll('new_campaigns', 24).subscribe();
        this.notificationBannerService.show('Campanha criada com sucesso!', 'success');
      },
      error: () => {
        this.notificationBannerService.show('Erro ao criar campanha', 'error');
      }
    });
  }
}