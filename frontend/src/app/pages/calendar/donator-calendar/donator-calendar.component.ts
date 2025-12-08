import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CustomHeaderComponent } from '../custom-header/custom-header.component';
import { CommonModule } from '@angular/common';
import { BloodBank, DailyAvailability, DonationDate, DonationService, Slot } from './donator-calendar.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NotificationBannerService } from '../../../shared/notification-banner/notification-banner.service';
import { UserAccountService } from '../../account/user-account/user-account.service';
import { PreloaderComponent } from '../../../shared/preloader/preloader.component';
import { QuestionnaireService } from '../../questionnaire/questionnaire.service';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-donator-calendar',
  standalone: true,
  imports: [
    MatDatepickerModule, MatCardModule, CommonModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, FormsModule, ReactiveFormsModule, PreloaderComponent, RouterModule,
  ],
  templateUrl: './donator-calendar.component.html',
  styleUrl: './donator-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
})
export class DonatorCalendarComponent implements OnInit, OnDestroy {
  readonly customHeader = CustomHeaderComponent;

  // Subject to manage unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationBannerService,
    private cdr: ChangeDetectorRef,
    private userService: UserAccountService,
    private donationService: DonationService,
    private questionnaireService: QuestionnaireService,
  ) {}

  availableBloodBanks: BloodBank[] = [];
  selectedBloodBankId: string | null = null;

  scheduleForm = new FormGroup({
    availableBloodBanks: new FormControl('', Validators.required),
    selectedDate: new FormControl('', Validators.required),
    donationTime: new FormControl('', Validators.required),
  });

  selectedDate: Date | null = null;
  availableDates: Date[] = [];
  availableDonationHours: Slot[] = [];

  dailyAvailabilityData: DailyAvailability[] = [];
  isLoadingAppointment: boolean = true;

  gender: string | null = null;
  canDonateAgain?: boolean;
  nextDonationDate: string | null = null;

  hasActiveAppointment: boolean | null = null;
  activeAppointment: {
    date: string;
    hour: string;
    bloodBankName: string;
    bloodBankTelephone: string;
    bloodBankEmail: string;
    status: string;
  } | null = null;

  canSchedule: boolean | null = null;

  async ngOnInit(): Promise<void> {
    await this.loadUsereligibility();
    await this.checkActiveAppointment();
    await this.checkIfUserCanDonate();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cancela o agendamento do usuário
   */
  public async cancelDonation() {
    if (!this.activeAppointment) {
      this.notificationService.show('Agendamento cancelado com sucesso!', 'success', 2000);
      this.activeAppointment = null;
    }

    // Confirmar cancelamento
    const confirmar = confirm('Tem certeza que deseja cancelar seu agendamento?');
    
    if (!confirmar) {
      return;
    }

    const userId = this.authService.getCurrentUserId();
    
    // Buscar o ID da doação ativa
    this.donationService.getUserDonations(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (donations: any[]) => {
          const activeDonation = donations.find(
            d => d.status !== 'CANCELLED' && d.status !== 'COMPLETED'
          );

          if (!activeDonation) {
            this.notificationService.show('Agendamento não encontrado', 'error', 1500);
            return;
          }

          // Realizar o cancelamento
          this.donationService.cancelDonation(activeDonation.id, userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: async () => {
                this.notificationService.show('Agendamento cancelado com sucesso!', 'success', 2000);
                this.activeAppointment = null;
                this.selectedBloodBankId = null;

                this.scheduleForm.reset();
                await this.loadUsereligibility();
                await this.checkActiveAppointment();
                await this.checkIfUserCanDonate();

                this.cdr.markForCheck();
              },
              error: (error) => {
                console.error('Erro ao cancelar:', error);
                this.notificationService.show(
                  'Erro ao cancelar agendamento. Tente novamente ou contate suporte4vidas@gmail.com', 
                  'error', 
                  3000
                );
                this.cdr.markForCheck();
              }
            });
        },
        error: () => {
          this.notificationService.show('Erro ao buscar agendamento', 'error', 1500);
          this.cdr.markForCheck();
        }
      }
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                          Donor Eligibility Check                            */
  /* -------------------------------------------------------------------------- */
  private async checkIfUserCanDonate(): Promise<void> {
    const userId = this.authService.getCurrentUserId();

    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: any) => {
          this.gender = user.gender;
          const intervalDays = this.gender === 'Masculino' ? 90 : 120;

          this.donationService.getUserDonations(userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (donations: any[]) => {
                const completed = donations
                  .filter(d => d.status === 'COMPLETED')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                if (completed.length === 0) {
                  this.canDonateAgain = true;
                } else {
                  const last = new Date(completed[0].date);
                  const next = new Date(last);
                  next.setDate(next.getDate() + intervalDays);

                  const today = new Date();
                  today.setHours(0,0,0,0);
                  next.setHours(0,0,0,0);

                  this.canDonateAgain = today >= next;
                  this.nextDonationDate = this.formatAppointmentDate(next.toISOString());
                }

                this.cdr.markForCheck();
              },
              error: () => {
                this.notificationService.show('Erro ao verificar histórico de doações');
                this.cdr.markForCheck();
              }
            });
        },
        error: () => {
          this.notificationService.show('Erro ao carregar usuário');
          this.cdr.markForCheck();
        }
      });
  }

  /* -------------------------------------------------------------------------- */
  /*                         Active Appointment Check                            */
  /* -------------------------------------------------------------------------- */
  private async checkActiveAppointment(): Promise<void> {
    const userId = this.authService.getCurrentUserId();

    this.isLoadingAppointment = true;

    this.donationService.getUserDonations(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (donations: any[]) => {
          const activeDonation = donations.find(
            d => d.status !== 'CANCELLED' && d.status !== 'COMPLETED'
          );

          if (activeDonation) {
            this.activeAppointment = null;
            this.updateActiveAppointmentData(activeDonation);
          } else {
            this.activeAppointment = null;
            this.loadBloodBanks();
          }

          this.isLoadingAppointment = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoadingAppointment = false;
          this.activeAppointment = null;
          this.notificationService.show('Erro ao verificar agendamentos');
          this.cdr.markForCheck();
        }
      });
  }

  private updateActiveAppointmentData(donation: any): void {
    this.donationService.getBloodBanksWithAvailableSlotsNotNull()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: banks => {
          const bank = banks.find(b => b.id === donation.bloodBankId);

          this.activeAppointment = {
            date: this.formatAppointmentDate(donation.date),
            hour: donation.hour,
            bloodBankName: bank?.name || 'Banco não encontrado',
            bloodBankTelephone: bank?.phone || 'Telefone não disponível',
            bloodBankEmail: bank?.email || 'Email não disponível',
            status: this.translateStatus(donation.status)
          };

          this.cdr.markForCheck();
        },
        error: () => {
          this.activeAppointment = {
            date: this.formatAppointmentDate(donation.date),
            hour: donation.hour,
            bloodBankName: 'Erro ao carregar',
            bloodBankTelephone: 'Erro ao carregar',
            bloodBankEmail: 'Erro ao carregar',
            status: this.translateStatus(donation.status)
          };
          this.cdr.markForCheck();
        }
      });
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Helpers                                   */
  /* -------------------------------------------------------------------------- */
  private loadBloodBanks(): void {
    this.donationService.getBloodBanksWithAvailableSlotsNotNull()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: banks => {
          this.availableBloodBanks = banks;
          this.cdr.markForCheck();
        },
        error: () => this.notificationService.show('Erro ao carregar bancos de sangue')
      });
  }

  private translateStatus(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return map[status] ?? status;
  }

  private formatAppointmentDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${date.getFullYear()}`;
  }

  private formatDateToString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  }

  /* -------------------------------------------------------------------------- */
  /*                                Calendar                                    */
  /* -------------------------------------------------------------------------- */
  availableDonationDates = (d: Date | null): boolean => {
    if (!d || this.dailyAvailabilityData.length === 0) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(d);
    selected.setHours(0, 0, 0, 0);

    if (selected <= today) return false;

    const dateString = this.formatDateToString(d);
    const day = this.dailyAvailabilityData.find(day => day.date === dateString);

    return !!day?.slots.some(slot => slot.availableSpots > 0);
  };

  /* -------------------------------------------------------------------------- */
  /*                          Blood Bank Selection                               */
  /* -------------------------------------------------------------------------- */
  onSelectBloodBankChange(bloodBankId: string) {
    if (this.hasActiveAppointment) {
      this.notificationService.show('Você já possui um agendamento ativo', 'warning', 3000);
      return;
    }

    this.selectedBloodBankId = bloodBankId;
    this.scheduleForm.get('selectedDate')?.reset();
    this.scheduleForm.get('donationTime')?.reset();
    this.selectedDate = null;
    this.availableDates = [];
    this.availableDonationHours = [];

    this.donationService.getAvailableDonationDates(bloodBankId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: dates => {
          this.dailyAvailabilityData = dates;
          this.availableDates = dates
            .filter(d => d.slots.some(s => s.availableSpots > 0))
            .map(d => new Date(d.date));
        },
        error: () => {
          this.availableDates = [];
          this.notificationService.show('Erro ao carregar as datas disponíveis', 'error', 3000);
        }
      });
  }

  onDateSelected(date: Date | null) {
    if (!date || !this.selectedBloodBankId) return;

    this.selectedDate = date;
    this.scheduleForm.get('donationTime')?.reset();
    this.availableDonationHours = [];

    const formatted = this.formatDateToString(date);

    this.donationService.getAvailableSlots(this.selectedBloodBankId, formatted)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: slots => {
          this.availableDonationHours = slots.slots
            .filter((s: { availableSpots: number; }) => s.availableSpots > 0)
            .map((s: { time: any; availableSpots: any; totalSpots: any; bookedSpots: any; }) => ({
              time: s.time,
              availableSpots: s.availableSpots,
              totalSpots: s.totalSpots,
              bookedSpots: s.bookedSpots
            }));

          this.cdr.markForCheck();
        },
        error: () => {
          this.availableDonationHours = [];
          this.notificationService.show('Erro ao carregar horários disponíveis', 'error', 3000);
          this.cdr.markForCheck();
        }
      });
  }

  /* -------------------------------------------------------------------------- */
  /*                                Scheduling                                   */
  /* -------------------------------------------------------------------------- */
  scheduleDonation() {
    if (this.activeAppointment) {
      this.notificationService.show('Você já possui um agendamento ativo', 'warning', 3000);
      return;
    }

    if (!this.selectedBloodBankId) return;

    const selectedDate = this.scheduleForm.get('selectedDate')?.value;
    const selectedHour = this.scheduleForm.get('donationTime')?.value;

    if (!selectedDate || !selectedHour) return;

    const [h, m] = selectedHour.split(':').map(Number);
    const date = new Date(selectedDate);
    date.setHours(h, m, 0, 0);

    const appointment: DonationDate = {
      userId: this.authService.getCurrentUserId(),
      bloodBankId: this.selectedBloodBankId,
      date: date.toISOString(),
      hour: date.toTimeString().substring(0, 5),
      slot: 1,
    };

    this.donationService.scheduleDonation(appointment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.show('Agendamento realizado com sucesso', 'success', 3000);
          this.checkActiveAppointment();

          if (this.selectedDate) {
            setTimeout(() => this.onDateSelected(this.selectedDate!), 500);
          }

          this.scheduleForm.get('donationTime')?.reset();
        },
        error: () => {
          this.notificationService.show('Erro ao realizar agendamento!', 'error', 3000);
        }
      });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'status-pending',
      CONFIRMED: 'status-confirmed',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
      Pendente: 'status-pending',
      Confirmado: 'status-confirmed',
      Completado: 'status-completed',
      Cancelado: 'status-cancelled'
    };
    return map[status] || 'status-pending';
  }

  /* -------------------------------------------------------------------------- */
  /*                                Scheduling Validation                       */
  /* -------------------------------------------------------------------------- */
  private async loadUsereligibility(): Promise<void> {
    this.questionnaireService.getUserQuestionnaires()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (questionnaireAnswer) => {
          if (questionnaireAnswer && questionnaireAnswer.length > 0) {
            this.canSchedule = questionnaireAnswer[0].eligible === true;
          } else {
            this.canSchedule = null;
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.canSchedule = null;
          this.notificationService.show('Erro ao verificar elegibilidade', 'error', 1500 );
          this.cdr.markForCheck();
        }
      });
  }
}