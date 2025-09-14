import { Component, ChangeDetectionStrategy, model, ViewEncapsulation, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CustomHeaderComponent } from '../custom-header/custom-header.component';
import { CommonModule } from '@angular/common';
import { BloodBank, DonationDate, DonationService } from './donator-calendar.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { UserStats } from '../../dashboard/dashboard.service';
import { NotificationBannerService } from '../../../shared/notification-banner/notification-banner.service';
import { NotificationBannerComponent } from "../../../shared/notification-banner/notification-banner.component";

@Component({
  selector: 'app-donator-calendar',
  standalone: true,
  imports: [MatDatepickerModule, MatCardModule, CommonModule, MatFormFieldModule, MatSelectModule, MatTimepickerModule, MatInputModule, FormsModule, ReactiveFormsModule, NotificationBannerComponent],
  templateUrl: './donator-calendar.component.html',
  styleUrl: './donator-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
})
export class DonatorCalendarComponent implements OnInit{

  readonly customHeader = CustomHeaderComponent;
  selected: Date | null = new Date();
  availableBloodBanks: BloodBank[] = [];
  selectedBloodBankId: string | null = null;
  userStats!: UserStats;
  lastDonationDate!: Date;
  timeUntilNextDonation!: number;
  nextDonationDate: Date | null = null;
  visible: boolean = false;

  scheduleForm = new FormGroup({
    availableBloodBanks: new FormControl('', Validators.required),
    donationTime: new FormControl('', Validators.required),
    selectedDate: new FormControl('', Validators.required),
  })

  availableDonationHours: string[] = [];
  dateRanges: {startDate: Date, endDate: Date}[] = [];
  timeRanges: {startTime: string, endTime: string}[] = [];
  
  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private notificationService: NotificationBannerService,
  ) {}

  setSelectedDate(date: Date) {
    if (!date) {
      this.availableDonationHours = [];
    }
    this.selected = date;
  }

  ngOnInit(): void {
    this.loadBloodBanksWithSlots();
    const userId = this.authService.getCurrentUserId();
  }


  loadBloodBanksWithSlots() {
    this.donationService.getBloodBanksWithAvailableSlots().subscribe({
      next: (banks) => {
        this.availableBloodBanks = banks;
      },
      error: () => {
        this.notificationService.show('Erro ao carregar bancos de sangue', 'error', 3000);
      }
    })
  }
  
  onDateSelected(date: Date | null) {
    if (!date) return;
    this.selected = date;
    this.setSelectedDate(date);
    this.loadAvailableHoursForDate(date);
  }

  generateTimeSlots(start: string, end: string): string[] {
    const slots: string[] = [];

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const startDate = new Date(1970, 0, 1, startHour, startMin);
    const endDate = new Date(1970, 0, 1, endHour, endMin);

    while (startDate < endDate) {
      const hours = startDate.getHours().toString().padStart(2, '0');
      const minutes = startDate.getMinutes().toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
      startDate.setMinutes(startDate.getMinutes() + 30); // incremento de 30 min
    }

    return slots;
  }

  loadAvailableHoursForDate(date: Date): void {
    this.donationService.getAvailableDonationHours().subscribe({
      next: (ranges) => {
        if (!ranges || ranges.length === 0) {
          this.availableDonationHours = [];
          return;
        }

        for (const range of ranges) {
          this.availableDonationHours = this.generateTimeSlots(range.startTime, range.endTime);
        }
      },
      error: () => {
        this.availableDonationHours = [];
      }
    });
  }

  scheduleDonation() {
    this.scheduleForm.updateValueAndValidity();

    const selectedDate: string | null | undefined = this.scheduleForm.get('selectedDate')?.value; 
    const selectedHour: string | null | undefined = this.scheduleForm.get('donationTime')?.value;

    if (!selectedDate || !selectedHour)  {
      return;
    }

    const [hour, minute] = selectedHour.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hour, minute, 0, 0);

    const appointment: DonationDate = {
      userId: this.authService.getCurrentUserId(),
      bloodBankId: this.selectedBloodBankId,
      date: appointmentDate.toISOString(),
      hour: appointmentDate.toString().substring(16, 24),
    };

    this.donationService.scheduleDonation(appointment).subscribe({
      next: () => {
        this.visible = true;
        this.notificationService.show('"Agendamento realizado com sucesso"', 'success', 3000);
        alert("Agendamento realizado com sucesso!");
      },
      error: (err) => {
        this.visible = true;
        this.notificationService.show('"Erro ao realizar agendamento!"', 'error', 3000);
        console.error(err);}
    });

  }

  timeUntinNextDonationCalculator(next: Date): any {
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextMidnight = new Date(next.getFullYear(), next.getMonth(), next.getDate());

    const diffInMs = nextMidnight.getTime() - todayMidnight.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    return diffInDays >= 0 ? diffInDays : 0;

  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  }

  onBloodBankSelect(bloodBankId: string) {
    this.selectedBloodBankId = bloodBankId;
  }

  onSelectBloodBankChange(bloodBankId: string): void {
    this.selectedBloodBankId = bloodBankId;

    this.scheduleForm.get('selectedDate')?.reset();
    this.scheduleForm.get('donationTime')?.reset();
    this.selected = null;
    this.availableDonationHours = [];

    this.donationService.getAvailableDonationDates(bloodBankId).subscribe(ranges => {
    this.dateRanges = ranges.map(range => ({
      startDate: new Date(range.startDate),
      endDate: new Date(range.endDate)
      }));
    });

    this.scheduleForm.get('selectedDate')?.updateValueAndValidity();
  }

  availableDonationDates = (d: Date | null): boolean => {
    if (!d || this.dateRanges.length === 0) {
      return false;
    } 

    return this.dateRanges.some(range => 
      d >= range.startDate && d <= range.endDate
    );
  };

}

