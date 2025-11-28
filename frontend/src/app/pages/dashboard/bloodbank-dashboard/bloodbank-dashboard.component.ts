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

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const;
type MonthType = typeof MONTHS[number];

@Component({
  selector: 'bloodbank-dashboard',
  imports: [CommonModule, BaseChartDirective, ModalComponent, FormCreateItemComponent, PreloaderComponent],
  templateUrl: './bloodbank-dashboard.component.html',
  styleUrl: './bloodbank-dashboard.component.scss'
})
export class BloodbankDashboardComponent implements OnInit {
  // Dados do dashboard
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
  // CONFIGURAÇÃO DO GRÁFICO DE DOAÇÕES
  // ==========================================
 // donationsOverTimeChartData = [{ data: [] as number[], label: 'Doações Completadas' }];

  donationsOverTimeChartData = [{ 
    data: [] as number[],
    label: '',
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
  // CONFIGURAÇÃO DO GRÁFICO DE TIPOS SANGUÍNEOS
  // ==========================================
  bloodTypeChartType = 'doughnut' as keyof ChartTypeRegistry;
  bloodColors: Record<string, string> = {
    'A+': '#75ee75',   'A-': '#1b6e1b',
    'B+': '#5dc2e4',   'B-': '#1a81e9',
    'AB+': '#fff599',  'AB-': '#ffe139',
    'O+': '#ff6262',   'O-': '#ff2929'
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
    private notificationService: NotificationBannerService,
  ) {}

  ngOnInit(): void {
    this.bloodbankId = this.authService.getCurrentUserId();
    this.getBloodBankCampaigns();
    this.loadDonations();
  }

  /**
   * Carrega e processa todas as doações do banco de sangue
   */
  async loadDonations(): Promise<void> {
    this.donationService.getBloodBankDonations(this.bloodbankId).subscribe({
      next: (donations: any[]) => {
        console.log('Doações carregadas:', donations);
        
        // Processa as estatísticas
        this.processAllStatistics(donations);
        
        // Atualiza os gráficos
        this.updateAllCharts();
        
        this.isLoadingBloodbankStats = false;
      },
      error: (error) => {
        console.error('Erro ao carregar doações:', error);
        this.notificationService.show('Erro ao carregar doações', 'error');
        this.isLoadingBloodbankStats = false;
      }
    });
  }

  /**
   * Processa todas as estatísticas a partir dos dados brutos
   */
  private processAllStatistics(donations: any[]): void {
    // 1. Contadores básicos
    const completedDonations = donations.filter(d => d.status === 'COMPLETED');
    const scheduledDonations = donations.filter(d => 
      d.status === 'PENDING' || d.status === 'CONFIRMED'
    );

    // 2. Doações ao longo do tempo (últimos 8 meses)
    const donationsOverTime = this.processDonationsOverTime(completedDonations);

    // 3. Distribuição de tipos sanguíneos
    const bloodTypeDistribution = this.processBloodTypeDistribution(completedDonations);

    // 4. Atualiza o objeto de estatísticas
    this.bloodbankStats = {
      totalDonations: completedDonations.length,
      scheduledDonations: scheduledDonations.length,
      donationsOverTime: donationsOverTime,
      bloodTypeBloodBags: bloodTypeDistribution as any
    };

    // 5. Calcula média
    this.averageDonation = this.calculateAverage(donationsOverTime);
  }

  /**
   * Processa doações ao longo dos últimos 8 meses
   */
  private processDonationsOverTime(completedDonations: any[]): DonationsOverTime[] {
    const now = new Date();
    const result: DonationsOverTime[] = [];

    // Cria estrutura para os últimos 8 meses
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      
      const monthData: DonationsOverTime = {
        month: MONTHS[monthIndex],
        year: date.getFullYear(),
        donations: 0
      };

      // Conta doações deste mês
      completedDonations.forEach(donation => {
        const donationDate = new Date(donation.date);
        if (donationDate.getFullYear() === date.getFullYear() && 
            donationDate.getMonth() === date.getMonth()) {
          monthData.donations++;
        }
      });

      result.push(monthData);
    }

    return result;
  }

  /**
   * Processa distribuição de tipos sanguíneos
   */
  private processBloodTypeDistribution(completedDonations: any[]): Record<string, number> {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const distribution: Record<string, number> = {};

    // Inicializa todos com zero
    bloodTypes.forEach(type => distribution[type] = 0);

    // Conta cada tipo
    completedDonations.forEach(donation => {
      if (donation.bloodType && bloodTypes.includes(donation.bloodType)) {
        distribution[donation.bloodType]++;
      }
    });

    return distribution;
  }

  /**
   * Calcula média de doações mensais
   */
  private calculateAverage(donationsOverTime: DonationsOverTime[]): number {
    if (!donationsOverTime || donationsOverTime.length === 0) return 0;
    
    const total = donationsOverTime.reduce((sum, d) => sum + d.donations, 0);
    return Math.round(total / donationsOverTime.length);
  }

  /**
   * Atualiza todos os gráficos
   */
  private updateAllCharts(): void {
    this.updateDonationsOverTimeChart();
    this.updateBloodTypeChart();
  }

  /**
   * Atualiza gráfico de doações ao longo do tempo
   */
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

  /**
   * Atualiza gráfico de tipos sanguíneos
   */
  private updateBloodTypeChart(): void {
    const distribution = this.bloodbankStats.bloodTypeBloodBags || {};
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    const data = bloodTypes.map(type => distribution[type] || 0);
    const hasData = data.some(value => value > 0);

    this.bloodTypeChartData = {
      labels: hasData ? bloodTypes : ['Sem dados'],
      datasets: [{
        label: 'Doações por tipo sanguíneo',
        data: hasData ? data : [1],
        backgroundColor: hasData ? 
          bloodTypes.map(type => this.bloodColors[type]) : 
          ['#cccccc']
      }]
    };
  }

  /**
   * Carrega campanhas do banco de sangue
   */
  private getBloodBankCampaigns(): void {
    this.bbDashboardService.getBloodbankCampaigns(this.bloodbankId).subscribe({
      next: (campaigns: Campaign[]) => {
        this.bloodbankCampaigns = campaigns;
        this.isLoadingBloodbankCampaigns = false;
      },
      error: () => {
        this.notificationService.show('Erro ao carregar campanhas', 'error');
        this.isLoadingBloodbankCampaigns = false;
      }
    });
  }

  /**
   * Cria nova campanha
   */
  createNewCampaign(data: any): void {
    this.isCampaignModalOpen = false;

    this.bbDashboardService.createCampaign(data).subscribe({
      next: () => {
        this.getBloodBankCampaigns();
        this.notificationService.show('Campanha criada com sucesso!', 'success');
      },
      error: () => {
        this.notificationService.show('Erro ao criar campanha', 'error');
      }
    });
  }
}