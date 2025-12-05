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
import { NotificationBannerService } from '../../shared/notification-banner/notification-banner.service';
import { Subject, takeUntil } from 'rxjs';

interface DashboardStats {
  scheduledDonations: number;
  totalDonations: number;
  monthlyAverage: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
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
  sortDirectionHour: 'asc' | 'desc' = 'asc';
  sortDirectionStatus: 'asc' | 'desc' = 'asc';
  
  bloodBankId: string = ''; 
  selectedDate: Date = new Date() // today
  readonly customHeader = CustomHeaderComponent;

  // Subject to manage unsubscribe
  private destroy$ = new Subject<void>();

  stats: DashboardStats = {
    scheduledDonations: 0,
    totalDonations: 0,
    monthlyAverage: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };
  
  todayDonations: DonationListItem[] = [];
  
  loadingStats = true;
  loadingDonations = true;

  constructor(private donationService: DonationInfoService, private notificationService: NotificationBannerService) {}

  authService = inject(AuthService);

  ngOnInit(): void {
    this.bloodBankId = this.authService.getCurrentUserId();
    this.loadStats();
    this.loadTodayDonations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carrega as estatísticas do dashboard
   */
loadStats(): void {
  this.loadingStats = true;
  
  this.donationService.getStats(this.bloodBankId)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data: any) => {
      this.stats.totalDonations = data.completedDonations || 0;
      this.stats.scheduledDonations = 
        (data.byStatus['PENDING'] || 0) + 
        (data.byStatus['CONFIRMED'] || 0);
      this.stats.monthlyAverage = Math.round(this.stats.totalDonations / 12);
      this.loadingStats = false;
      this.stats.pending = (data.byStatus['PENDING'] || 0);
      this.stats.confirmed = (data.byStatus['CONFIRMED'] || 0);
      this.stats.completed = (data.byStatus['COMPLETED'] || 0);
      this.stats.cancelled = (data.byStatus['CANCELLED'] || 0);
    },
    error: (err: any) => {
      console.error('Erro:', err);
      this.loadingStats = false;
    }
  });
}

/**
 * Formata Date para YYYY-MM-DD (sem timezone)
 */
private formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Carrega os agendamentos do dia selecionado
 */
loadTodayDonations(): void {
  this.loadingDonations = true;
  
  const dateStr = this.formatDateForAPI(this.selectedDate);
  
  this.donationService.getBloodBankDonations(
    this.bloodBankId,
    dateStr
  )
  .pipe(takeUntil(this.destroy$))
  .subscribe({
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
    this.loadTodayDonations();
  }
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
    this.donationService.confirmDonation(donationId, this.bloodBankId)
    .pipe(takeUntil(this.destroy$))    
    .subscribe({
      next: (response: any) => {
        this.notificationService.show('Doação confirmada!' ,"success", 3000);
        this.loadTodayDonations();
        this.loadStats();
      },
      error: (err: any) => {
        this.notificationService.show('Erro ao confirmar doação!', "error", 3000);
      }
    });
  }

  /**
   * Completar uma doação
   */
  completeDonation(donationId: string, notes?: string): void {
    this.donationService.completeDonation(donationId, this.bloodBankId, notes)
    .pipe(takeUntil(this.destroy$))    
    .subscribe({
      next: (response: any) => {
        this.notificationService.show('Doação completada!' ,"success", 3000);
        // Recarregar lista e estatísticas
        this.loadTodayDonations();
        this.loadStats();
      },
      error: (err: any) => {
        this.notificationService.show('Erro ao completar doação!', "error", 3000);
      }
    });
  }

  /**
   * Cancelar uma doação (pelo banco de sangue)
   */
  cancelDonation(donationId: string, userId: string): void {

      this.donationService.cancelDonation(donationId, userId)
      .pipe(takeUntil(this.destroy$))      
      .subscribe({
        next: (response: any) => {
        this.notificationService.show('Doação cancelada!' ,"success", 3000);
          // Recarregar lista e estatísticas
          this.loadTodayDonations();
          this.loadStats();
        },
        error: (err: { error: { message: any; }; }) => {
          this.notificationService.show('Erro ao cancelar doação!' + (err.error?.message || 'Erro desconhecido'), "error", 3000);
        }
      });
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

  sortByHour() {
    this.todayDonations.sort((a, b) => {
      const timeA = a.hour.toLowerCase();
      const timeB = b.hour.toLowerCase();

      return this.sortDirectionHour === 'asc'
        ? timeA.localeCompare(timeB)
        : timeB.localeCompare(timeA);
    });

    this.sortDirectionHour = this.sortDirectionHour === 'asc' ? 'desc' : 'asc';
  }

  sortByStatus() {
    this.todayDonations.sort((a, b) => {
      const statusA = this.getStatusLabel(a.status).toLowerCase();
      const statusB = this.getStatusLabel(b.status).toLowerCase();

      return this.sortDirectionStatus === 'asc'
        ? statusA.localeCompare(statusB)
        : statusB.localeCompare(statusA);
    });

    this.sortDirectionStatus = this.sortDirectionStatus === 'asc' ? 'desc' : 'asc';
  }
}