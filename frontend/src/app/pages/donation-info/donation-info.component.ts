import { Component, inject, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { PreloaderComponent } from '../../shared/preloader/preloader.component';
import { AuthService } from '../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { DonationInfoService } from './donation-info.service';
import { DonationResponse, DonationStatus } from './donation.model';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { CustomHeaderComponent } from '../calendar/custom-header/custom-header.component';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

interface DashboardStats {
  scheduledDonations: number;
  totalDonations: number;
  monthlyAverage: number;
}

interface DonationListItem {
  id: string;
  userName: string;
  bloodType: string;
  date: string;
  hour: string;
  status: DonationStatus;
  userId: string;
}

@Component({
  selector: 'app-donation-info',
  templateUrl: './donation-info.component.html',
  styleUrls: ['./donation-info.component.scss'],
  imports: [PreloaderComponent, CommonModule, MatDatepickerModule, MatInputModule, FormsModule, MatDatepickerModule, MatInputModule, MatNativeDateModule],
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
})
export class DonationInfoComponent implements OnInit {
  
  bloodBankId: string = ''; 
  selectedDate: Date = new Date() // today
  readonly customHeader = CustomHeaderComponent;

  stats: DashboardStats = {
    scheduledDonations: 0,
    totalDonations: 0,
    monthlyAverage: 0
  };
  
  todayDonations: DonationListItem[] = [];
  
  loadingStats = true;
  loadingDonations = true;

  constructor(private donationService: DonationInfoService) {}

  authService = inject(AuthService);

  ngOnInit(): void {
    this.bloodBankId = this.authService.getCurrentUserId();
    // this.bloodBankId = 'BLOODBANK_ID_AQUI';
    
    this.loadDashboardStats();
    this.loadTodayDonations();
  }

  /**
   * Carrega as estatísticas do dashboard
   */
  loadDashboardStats(): void {
    this.loadingStats = true;
    
    // Período: último ano para calcular estatísticas
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 1);
    
    this.donationService.getStats(
      this.bloodBankId,
      startDate.toISOString(),
      endDate.toISOString()
    ).subscribe({
      next: (data: { completedDonations: number; byStatus: { [x: string]: any; }; }) => {
        console.log('Stats received:', data);
        
        // Total de doações completadas
        this.stats.totalDonations = data.completedDonations || 0;
        
        // Doações agendadas (PENDING + CONFIRMED)
        this.stats.scheduledDonations = 
          (data.byStatus['PENDING'] || 0) + 
          (data.byStatus['CONFIRMED'] || 0);
        
        // Média mensal (total de doações / 12 meses)
        this.stats.monthlyAverage = Math.round(this.stats.totalDonations / 12);
        
        this.loadingStats = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar estatísticas:', err);
        this.loadingStats = false;
      }
    });
  }

  /**
   * Carrega os agendamentos do dia selecionado
   */
  loadTodayDonations(): void {
    this.loadingDonations = true;
    
    // Converte Date para ISO String
    const dateStr = this.selectedDate.toISOString();
    
    this.donationService.getBloodBankDonations(
      this.bloodBankId,
      dateStr
    ).subscribe({
      next: (donations) => {
        this.todayDonations = donations.map(d => ({
          id: d.id,
          userName: d.userName || 'Nome não disponível',
          bloodType: d.bloodType,
          date: d.date,
          hour: d.hour,
          status: d.status,
          userId: d.userId
        })).sort((a, b) => a.hour.localeCompare(b.hour));
        
        this.loadingDonations = false;
      },
      error: (err) => {
        console.error('Erro:', err);
        this.loadingDonations = false;
      }
    });
  }

  /**
   * Atualiza a lista quando mudar a data
   */
  onDateChange(event: MatDatepickerInputEvent<Date>): void {
  if (event.value) {
    this.selectedDate = event.value;
    // Converte para ISO String para a API
    const isoDate = event.value.toISOString();
    console.log(isoDate);
    this.loadTodayDonations();
  }
}

  /**
   * Formata a data para exibição
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Retorna classe CSS baseada no status
   */
  getStatusClass(status: DonationStatus): string {
    switch(status) {
      case DonationStatus.PENDING: return 'status-pending';
      case DonationStatus.CONFIRMED: return 'status-confirmed';
      case DonationStatus.COMPLETED: return 'status-completed';
      case DonationStatus.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  }

  /**
   * Retorna texto legível do status
   */
  getStatusLabel(status: DonationStatus): string {
    switch(status) {
      case DonationStatus.PENDING: return 'Pendente';
      case DonationStatus.CONFIRMED: return 'Confirmado';
      case DonationStatus.COMPLETED: return 'Completado';
      case DonationStatus.CANCELLED: return 'Cancelado';
      case DonationStatus.NO_SHOW: return 'Não Compareceu';
      default: return status;
    }
  }

  /**
   * Confirmar uma doação
   */
  confirmDonation(donationId: string): void {
    this.donationService.confirmDonation(donationId, this.bloodBankId).subscribe({
      next: (response: any) => {
        console.log('Doação confirmada:', response);
        // Recarregar lista
        this.loadTodayDonations();
        this.loadDashboardStats();
      },
      error: (err: any) => {
        console.error('Erro ao confirmar doação:', err);
        alert('Erro ao confirmar doação');
      }
    });
  }

  /**
   * Completar uma doação
   */
  completeDonation(donationId: string, notes?: string): void {
    this.donationService.completeDonation(donationId, this.bloodBankId, notes).subscribe({
      next: (response: any) => {
        console.log('Doação completada:', response);
        // Recarregar lista e estatísticas
        this.loadTodayDonations();
        this.loadDashboardStats();
      },
      error: (err: any) => {
        console.error('Erro ao completar doação:', err);
        alert('Erro ao completar doação');
      }
    });
  }

  /**
   * Cancelar uma doação (pelo banco de sangue)
   */
  cancelDonation(donationId: string, userId: string): void {
    const reason = prompt('Motivo do cancelamento (opcional):');
    
    // Permitir cancelamento mesmo sem motivo
    if (reason !== null) { // null = usuário clicou em "Cancelar" no prompt
      this.donationService.cancelDonation(donationId, userId, reason || undefined).subscribe({
        next: (response: any) => {
          console.log('Doação cancelada:', response);
          // Recarregar lista e estatísticas
          this.loadTodayDonations();
          this.loadDashboardStats();
        },
        error: (err: { error: { message: any; }; }) => {
          console.error('Erro ao cancelar doação:', err);
          alert('Erro ao cancelar doação: ' + (err.error?.message || 'Erro desconhecido'));
        }
      });
    }
  }

  /**
   * Verifica se a doação pode ser cancelada
   */
  canCancel(status: DonationStatus): boolean {
    return status === DonationStatus.PENDING || status === DonationStatus.CONFIRMED;
  }

  /**
   * Verifica se a doação pode ser confirmada
   */
  canConfirm(status: DonationStatus): boolean {
    return status === DonationStatus.PENDING;
  }

  /**
   * Verifica se a doação pode ser completada
   */
  canComplete(status: DonationStatus): boolean {
    return status === DonationStatus.PENDING || status === DonationStatus.CONFIRMED;
  }
}