import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { PreloaderComponent } from '../../shared/preloader/preloader.component';
import { AuthService } from '../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { DonationInfoService } from './donation-info.service';
import { DonationStatus } from './donation.model';
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
  imports: [
    PreloaderComponent, 
    CommonModule, 
    MatDatepickerModule, 
    MatInputModule, 
    FormsModule, 
    MatDatepickerModule, 
    MatInputModule, 
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
})
export class DonationInfoComponent implements OnInit {
  sortDirectionHour: 'asc' | 'desc' = 'asc';
  sortDirectionStatus: 'asc' | 'desc' = 'asc';
  
  bloodBankId: string = '';
  donationDates: Set<string> = new Set();
  selectedDate: Date = new Date(); // today
  readonly customHeader = CustomHeaderComponent;

  // Subject to handle unsubscribe
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

  constructor(
    private donationService: DonationInfoService,
    private notificationBannerService: NotificationBannerService,
  ) {}

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
   * Loads dashboard statistics
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

          this.stats.pending = data.byStatus['PENDING'] || 0;
          this.stats.confirmed = data.byStatus['CONFIRMED'] || 0;
          this.stats.completed = data.byStatus['COMPLETED'] || 0;
          this.stats.cancelled = data.byStatus['CANCELLED'] || 0;

          this.loadingStats = false;
        },
        error: () => {
          this.notificationBannerService.show('Erro ao buscar as informações de doações. Contate suporte4vidas@gmail.com', 'error');
          this.loadingStats = false;
        }
      });
  }

  /**
   * Formats Date to YYYY-MM-DD (timezone-safe)
   */
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateToString(date: Date | string): string {
    if (!date) return '';
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Loads donations for the selected day
   */
  loadTodayDonations(): void {
    this.loadingDonations = true;
    this.donationService.getBloodBankDonations(this.bloodBankId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (donations) => {
          donations.forEach(donation => {
            const dateKey = this.formatDateToString(donation.date);
            if (dateKey) this.donationDates.add(dateKey);
          });
        }
      });
    
    const dateStr = this.formatDateForAPI(this.selectedDate);
    this.donationService.getBloodBankDonations(this.bloodBankId, dateStr)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (donations) => {
          this.todayDonations = donations
            .map(d => ({
              id: d.id,
              userName: d.userName || 'Nome não disponível.',
              bloodType: d.bloodType,
              date: d.date,
              hour: d.hour,
              status: d.status,
              userId: d.userId
            }))
            .sort((a, b) => a.hour.localeCompare(b.hour));

          this.loadingDonations = false;
        },
        error: () => {
          this.notificationBannerService.show('Erro ao buscar as doações do dia. Contate suporte4vidas@gmail.com', 'error');
          this.loadingDonations = false;
        }
      });
  }

  /**
   * Updates list when date changes
   */
  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.selectedDate = event.value;
      this.loadTodayDonations();
    }
  }

  /**
   * Returns CSS class based on status
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
   * Returns readable status text
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
   * Confirms a donation
   */
  confirmDonation(donationId: string): void {
    this.donationService.confirmDonation(donationId, this.bloodBankId)
    .pipe(takeUntil(this.destroy$))    
    .subscribe({
      next: () => {
        this.notificationBannerService.show('Doação confirmada!' ,"success", 3000);
        this.loadTodayDonations();
        this.loadStats();
      },
      error: () => {
        this.notificationBannerService.show('Erro ao confirmar doação!', "error", 3000);
      }
    });
  }

  /**
   * Completes a donation
   */
  completeDonation(donationId: string, notes?: string): void {
    this.donationService.completeDonation(donationId, this.bloodBankId, notes)
      .pipe(takeUntil(this.destroy$))    
      .subscribe({
        next: () => {
          this.notificationBannerService.show('Doação completada!', "success", 3000);
          this.loadTodayDonations();
          this.loadStats();
        },
        error: () => {
          this.notificationBannerService.show('Erro ao completar doação. Contate suporte4vidas@gmail.com', "error", 3000);
        }
      });
  }

  /**
   * Cancels a donation (blood bank action)
   */
  cancelDonation(donationId: string, userId: string): void {
    this.donationService.cancelDonation(donationId, userId)
      .pipe(takeUntil(this.destroy$))      
      .subscribe({
        next: () => {
          this.notificationBannerService.show('Doação cancelada.', "success", 3000);
          this.loadTodayDonations();
          this.loadStats();
        },
        error: () => {
          this.notificationBannerService.show('Erro ao cancelar doação. Contate suporte4vidas@gmail.com', "error", 3000);
        }
      });
  }

  /**
   * Checks if donation can be cancelled
   */
  canCancel(status: DonationStatus): boolean {
    return status === DonationStatus.PENDING || status === DonationStatus.CONFIRMED;
  }

  /**
   * Checks if donation can be confirmed
   */
  canConfirm(status: DonationStatus): boolean {
    return status === DonationStatus.PENDING;
  }

  public isToday = (dateString: string | number | Date) => {
    const today = new Date();
    const donationDate = new Date(dateString);
    return today.toDateString() === donationDate.toDateString();
  };

  public canComplete = (donation: any) => {
    const validStatus = donation.status === 'pending' || donation.status === 'confirmed';
    return validStatus && this.isToday(donation.date);
  };

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

    this.sortDirectionStatus =
      this.sortDirectionStatus === 'asc' ? 'desc' : 'asc';
  }

  datesWithDonations = (d: Date | null): boolean => {
    if (!d || this.donationDates.size === 0) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(d);
    selected.setHours(0, 0, 0, 0);

    const year = selected.getFullYear();
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const day = String(selected.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;

    return this.donationDates.has(formatted);
  };
}