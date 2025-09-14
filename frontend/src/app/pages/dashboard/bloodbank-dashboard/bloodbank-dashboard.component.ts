import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import { BloodBankDashboardService, BloodBankStats } from './bloodbank-dashboard.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { BloodType } from '../../../shared/app.enums';
import { Campaign } from '../dashboard.service';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { FormCreateItemComponent } from '../../../shared/form-create-item/form-create-item.component';
import { PreloaderComponent } from "../../../shared/preloader/preloader.component";

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Component({
  selector: 'app-bloodbank-dashboard',
  imports: [CommonModule, BaseChartDirective, ModalComponent, FormCreateItemComponent, PreloaderComponent],
  templateUrl: './bloodbank-dashboard.component.html',
  styleUrl: './bloodbank-dashboard.component.scss'
})
export class BloodbankDashboardComponent implements OnInit {
  bloodbankStats: BloodBankStats = {} as any;
  bloodbankCampaigns: Campaign[] = [];
  private bloodbankId: string = "";
  isCampaignModalOpen: boolean = false;
  averageDonation: number = 0;

  // Preloaders
  isLoadingBloodbankStats: boolean = true;
  isLoadingBloodbankCampaigns: boolean = true;

  /**
   * Donations over time chart data and configuration.
   * This chart displays the number of donations made over the last 6 months.
   */
  donationsOverTimeChartData = [{ data: [0, 0, 0, 0, 0, 0, 0, 0], label: 'Doações' }];
  donationsOverTimeChartLabels = ['', '', '', '', '', '', '', ''];
  donationsOverTimeChartType = 'line' as keyof ChartTypeRegistry;
  public donationsOverTimeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    
    scales: {
      y: {
        beginAtZero: true,
        min: 0
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Poppins, sans-serif',
            size: 18,
            weight: 'bold',
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#ddd',
        borderColor: '#888',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        titleFont: {
          size: 17,
          weight: 'bold'
        },
        bodyFont: {
          size: 15
        },
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return ` ${context.label}: ${value} doações`;
          },
        },
      },
    },
  };

  /**
   * Blood type distribution chart data and configuration.
   * This chart displays the number of available blood bags for each blood type.
   */
  bloodTypeChartType = 'doughnut' as keyof ChartTypeRegistry;
  bloodColors: Record<string, string> = {
    'AB-': '#ffe139',   // strong yellow
    'AB+': '#fff599',   // light yellow
    'O-': '#ff2929',    // strong red
    'O+': '#ff6262',    // light red
    'A-': '#1b6e1b',    // strong green
    'A+': '#75ee75',    // light green
    'B-': '#1a81e9',    // strong blue
    'B+': '#5dc2e4'     // light blue
  };
  bloodTypeChartData = {
    labels: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'],
    datasets: [
      {
        label: 'Bolsas disponíveis',
        data: [0,0,0,0,0,0,0,0],
        backgroundColor: [
          this.bloodColors['AB+'],
          this.bloodColors['AB-'],
          this.bloodColors['O+'],
          this.bloodColors['O-'],
          this.bloodColors['A+'],
          this.bloodColors['A-'],
          this.bloodColors['B+'],
          this.bloodColors['B-']
        ],
      } // deixaram um daltonico escolher as cores
    ]
  };
  
  public bloodTypeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Poppins, sans-serif',
            size: 20,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#ddd',
        borderColor: '#888',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        titleFont: {
          size: 17,
          weight: 'bold'
        },
        bodyFont: {
          size: 15
        },
        callbacks: {
          label: (context) => {
            const bags = context.raw as number;
            const averageLiters = 0.445; // 445ml = média entre 420ml e 470ml
            const totalLiters = (bags * averageLiters).toFixed(1);
            return [
              ` Bolsas disponíveis: ${bags}`,
              ` Volume aproximado: ${totalLiters} L`
            ];
          },
        },
      },
    },
  };

  constructor(private bbDashboardService: BloodBankDashboardService, private authService: AuthService) {}

  // Fetch blood bank statistics when the component initializes
  ngOnInit(): void {
    this.bloodbankId = this.authService.getCurrentUserId();
    this.getBloodBankStats();
    this.getBloodBankCampaigns();
  }

  /**
   * Fetches the blood bank statistics from the server and stores them in the component.
   * This includes total donations, scheduled donations, donations over time, and blood type distribution.
   */
  private getBloodBankStats(): void {
    this.bbDashboardService.getBloodbankStats(this.bloodbankId).subscribe((bloodbankStats: BloodBankStats) => {
      this.bloodbankStats = bloodbankStats;
      this.getDonationsOverTimeChartData();
      this.getBloodTypeChartData();
      this.getAverageDonations();
      this.isLoadingBloodbankStats = false;
    });
  }

  /**
   * Fetches the bloodbank campaigns from the server and stores them in the component.
   */
  private getBloodBankCampaigns(): void {
    this.bbDashboardService.getBloodbankCampaigns(this.bloodbankId).subscribe((bloodbankCampaigns: Campaign[]) => {
      this.bloodbankCampaigns = bloodbankCampaigns;
      this.isLoadingBloodbankCampaigns = false;
    });
  }

  /**
   * Processes the donations over time data to prepare it for the chart.
   * It sorts the data by year and month, and extracts the labels and data for the chart.
   */
  private getDonationsOverTimeChartData(): void {
    if (!this.bloodbankStats.donationsOverTime) return;

    const sortedData = [...this.bloodbankStats.donationsOverTime].sort((a, b) => {
      const aIndex = a.year * 100 + MONTHS.indexOf(a.month);
      const bIndex = b.year * 100 + MONTHS.indexOf(b.month);
      return aIndex - bIndex;
    });

    const last8 = sortedData.slice(-8);

    this.donationsOverTimeChartLabels = last8.map(item => item.month + " de " + item.year);
    this.donationsOverTimeChartData = [{
      data: last8.map(item => item.donations),
      label: 'Doações'
    }];
  }

  private getAverageDonations(): void {
    const donations = this.bloodbankStats.donationsOverTime;
    if (!donations || donations.length === 0) {
      this.averageDonation = 0;
      return;
    }

    const total = donations.reduce((sum, d) => sum + d.donations, 0);
    this.averageDonation = Math.round(total / donations.length);
  }

  /**
   * Processes the blood type distribution data to prepare it for the chart.
   * It extracts the labels and data for the chart based on the blood type distribution.
   */
  private getBloodTypeChartData(): void {
    if (!this.bloodbankStats.bloodTypeBloodBags) return;

    const labels = Object.keys(this.bloodbankStats.bloodTypeBloodBags);
    const data = labels.map(label => this.bloodbankStats.bloodTypeBloodBags[label as keyof typeof BloodType]);

    this.bloodTypeChartData = {
      labels,
      datasets: [{
        label: 'Bolsas disponíveis',
        data,
        backgroundColor: [
          this.bloodColors['AB+'],
          this.bloodColors['AB-'],
          this.bloodColors['O+'],
          this.bloodColors['O-'],
          this.bloodColors['A+'],
          this.bloodColors['A-'],
          this.bloodColors['B+'],
          this.bloodColors['B-']
        ],
      }]
    };
  }

  createNewCampaign(data: any): void {
    this.isCampaignModalOpen = false;

    this.bbDashboardService.createCampaign(data).subscribe(() => {
      this.getBloodBankCampaigns();
    });
  }
}
