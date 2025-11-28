import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CustomHeaderComponent } from '../custom-header/custom-header.component';
import { CommonModule } from '@angular/common';
import { BloodBank, DailyAvailability, DonationDate, DonationService, DonationStatus, Slot } from './donator-calendar.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NotificationBannerService } from '../../../shared/notification-banner/notification-banner.service';
import { UserAccountService } from '../../account/user-account/user-account.service';
import { PreloaderComponent } from '../../../shared/preloader/preloader.component';

@Component({
  selector: 'app-donator-calendar',
  standalone: true,
  imports: [
    MatDatepickerModule, MatCardModule, CommonModule, MatFormFieldModule, 
    MatSelectModule, MatInputModule, FormsModule, ReactiveFormsModule, PreloaderComponent
  ],
  templateUrl: './donator-calendar.component.html',
  styleUrl: './donator-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
})
export class DonatorCalendarComponent implements OnInit {

  readonly customHeader = CustomHeaderComponent;

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
  visible: boolean = false;
  dailyAvailabilityData: DailyAvailability [] = [];
  availableHours: any[] = [];
  donations: any[] = [];
  isLoadingAppointment: boolean = true;
  gender: string | null = null;
  canDonateAgain: boolean = true;
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

  constructor(
    private authService: AuthService,
    private notificationService: NotificationBannerService,
    private cdr: ChangeDetectorRef,
    private userService: UserAccountService,
  ) {}

  donationService = inject(DonationService);

  async ngOnInit(): Promise<void> {
    await this.checkActiveAppointment();
    await this.checkIfUserCanDonate();
  }

  private loadBloodBanks() {
    this.donationService.getBloodBanksWithAvailableSlots().subscribe({
      next: banks => {
        this.availableBloodBanks = banks;
        this.cdr.markForCheck();
      },
      error: () => this.notificationService.show('Erro ao carregar bancos de sangue')
    });
  }

  private async checkIfUserCanDonate(): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    
    this.userService.getUser().subscribe({
      next: (user: any) => {
        this.gender = user.gender;
        
        // Define o intervalo de dias baseado no gênero
        const intervalDays = this.gender === 'Masculino' ? 90 : 120;
        
        // Busca as doações do usuário
        this.donationService.getUserDonations(userId).subscribe({
          next: (donations: any[]) => {
            // Encontra a última doação completada
            const completedDonations = donations.filter(
              donation => donation.status === 'COMPLETED'
            );
            
            if (completedDonations.length > 0) {
              // Ordena por data decrescente e pega a mais recente
              const lastCompletedDonation = completedDonations.sort((a, b) => 
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )[0];
              
              // Calcula a data da última doação
              const lastDonationDate = new Date(lastCompletedDonation.date);
              
              // Calcula a próxima data permitida
              const nextAllowedDate = new Date(lastDonationDate);
              nextAllowedDate.setDate(nextAllowedDate.getDate() + intervalDays);
              
              // Verifica se já passou o intervalo necessário
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              nextAllowedDate.setHours(0, 0, 0, 0);
              
              if (today < nextAllowedDate) {
                this.canDonateAgain = false;
                this.nextDonationDate = this.formatAppointmentDate(nextAllowedDate.toISOString());
              } else {
                this.canDonateAgain = true;
                this.nextDonationDate = null;
              }
            } else {
              // Se não há doações completadas, pode doar
              this.canDonateAgain = true;
              this.nextDonationDate = null;
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


  /**
   * Verifica se o usuário possui um agendamento ativo
   * (status diferente de "cancelado" ou "completado")
   */
  private async checkActiveAppointment(): Promise<void> {
    const userId = this.authService.getCurrentUserId();
    
    this.donationService.getUserDonations(userId).subscribe({
      next: (donations: any[]) => {
        // Filtra apenas agendamentos ativos (não cancelados nem completados)
        const activeDonation = donations.find(
          donation => donation.status !== 'CANCELLED' && 
                     donation.status !== 'COMPLETED'
        );

        if (activeDonation) {
          this.isLoadingAppointment = false;
          this.hasActiveAppointment = true;
          this.updateActiveAppointmentData(activeDonation);
        } else {
          this.isLoadingAppointment = false;
          this.hasActiveAppointment = false;
          this.activeAppointment = null;
          this.loadBloodBanks();
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.notificationService.show('Erro ao verificar agendamentos');
        this.cdr.markForCheck();
      }
    });
  }

  private updateActiveAppointmentData(donation: any): void {
    // Carrega os bancos para pegar o nome
    this.donationService.getBloodBanksWithAvailableSlots().subscribe({
      next: banks => {
        const bloodBank = banks.find(bank => bank.id === donation.bloodBankId);
        
        this.activeAppointment = {
          date: this.formatAppointmentDate(donation.date),
          hour: donation.hour,
          bloodBankName: bloodBank?.name || 'Banco não encontrado',
          bloodBankTelephone: bloodBank?.phone || 'Telefone não disponível',
          bloodBankEmail: bloodBank?.email || 'Email não disponível',
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

  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmado',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  private formatAppointmentDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Filtro do calendário: habilita apenas datas disponíveis
  availableDonationDates = (d: Date | null): boolean => {
    if (!d || this.dailyAvailabilityData.length === 0) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(d);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) return false;
    
    // Verifica disponibilidade
    const dateString = this.formatDateToString(d);
    const dayData = this.dailyAvailabilityData.find(data => data.date === dateString);

    return dayData ? dayData.slots.some(slot => slot.availableSpots > 0) : false;
  };

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Quando muda o banco
  onSelectBloodBankChange(bloodBankId: string) {
    // Impede alteração se houver agendamento ativo
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
      .subscribe({    
        next: dates => {
          this.dailyAvailabilityData = dates;
          this.availableDates = dates
          .filter((d: { slots: any[]; }) => d.slots.some((slot: { availableSpots: number; }) => slot.availableSpots > 0))
          .map((d: { date: string | number | Date; }) => new Date(d.date));
        },
        error: (err) => {
          this.availableDates = [];
          this.notificationService.show('Erro ao carregar as datas disponíveis', 'error', 3000);
        },
    })
  }

  onDateSelected(date: Date | null) {
    if (!date || !this.selectedBloodBankId) return;
    
    this.selectedDate = date;
    this.scheduleForm.get('donationTime')?.reset();
    this.availableDonationHours = [];
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0')

    const newDate = `${yyyy}-${mm}-${dd}`;
    
    this.donationService.getAvailableSlots(this.selectedBloodBankId, newDate).subscribe({
      next: (slotsData) => {
        this.availableDonationHours = slotsData.slots
          .filter((slot: { availableSpots: number; }) => slot.availableSpots > 0)
          .map((slot: { time: any; availableSpots: any; totalSpots: any; bookedSpots: any; }) => ({
            time: slot.time,
            availableSpots: slot.availableSpots,
            totalSpots: slot.totalSpots,
            bookedSpots: slot.bookedSpots
          }));
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.availableDonationHours = [];
        this.notificationService.show('Erro ao carregar horários disponíveis', 'error', 3000);
        this.cdr.markForCheck();
      }
    });
  }

  // Agendamento
  scheduleDonation() {
    // Impede agendamento se já existir um ativo
    if (this.hasActiveAppointment) {
      this.notificationService.show('Você já possui um agendamento ativo', 'warning', 3000);
      return;
    }

    if (!this.selectedBloodBankId) return;

    const selectedDate: string | undefined = this.scheduleForm.get('selectedDate')?.value ?? undefined;
    const selectedHour: string | undefined = this.scheduleForm.get('donationTime')?.value ?? undefined;

    if (!selectedDate || !selectedHour) return;

    const [hour, minute] = selectedHour.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hour, minute, 0, 0);

    const appointment: DonationDate = {
      userId: this.authService.getCurrentUserId(),
      bloodBankId: this.selectedBloodBankId,
      date: appointmentDate.toISOString(),
      hour: appointmentDate.toTimeString().substring(0, 5),
      slot: 1,
    };

    this.donationService.scheduleDonation(appointment).subscribe({
      next: () => {
        this.notificationService.show('Agendamento realizado com sucesso', 'success', 3000);        
        
        // Recarrega a verificação de agendamento ativo
        this.checkActiveAppointment();
        
        // Recarrega os slots da mesma data
        if (this.selectedDate) {
          setTimeout(() => {
            this.onDateSelected(this.selectedDate);
          }, 500);
        }
        this.scheduleForm.get('donationTime')?.reset();
      },
      error: (err) => {
        this.notificationService.show('Erro ao realizar agendamento!', 'error', 3000);
      }
    });
  }
  
  getStatusClass(status: string): string {
    const statusClassMap: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled',
      'Pendente': 'status-pending',
      'Confirmado': 'status-confirmed',
      'Completado': 'status-completed',
      'Cancelado': 'status-cancelled'
    };
    return statusClassMap[status] || 'status-pending';
  }
}