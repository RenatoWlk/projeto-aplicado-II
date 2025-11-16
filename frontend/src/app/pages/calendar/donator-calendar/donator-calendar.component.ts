import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit, inject } from '@angular/core';
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

@Component({
  selector: 'app-donator-calendar',
  standalone: true,
  imports: [
    MatDatepickerModule, MatCardModule, CommonModule, MatFormFieldModule, 
    MatSelectModule, MatInputModule, FormsModule, ReactiveFormsModule
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

  constructor(
    private authService: AuthService,
    private notificationService: NotificationBannerService
  ) {}

  donationService = inject(DonationService);

  async ngOnInit(): Promise<void> {
    this.loadBloodBanks();
  }

  private loadBloodBanks() {
    this.donationService.getBloodBanksWithAvailableSlots().subscribe({
      next: banks => this.availableBloodBanks = banks,
      error: () => this.notificationService.show('Erro ao carregar bancos de sangue', 'error', 3000)
    });
  }

  // Filtro do calendário: habilita apenas datas disponíveis
  availableDonationDates = (d: Date | null): boolean => {
    if (!d || this.dailyAvailabilityData.length === 0) return false;
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
      },
      error: (err) => {
        this.availableDonationHours = [];
        this.notificationService.show('Erro ao carregar horários disponíveis', 'error', 3000);
      }
  });
}

  // Agendamento
  scheduleDonation() {
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
}
