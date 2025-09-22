import { Component, ChangeDetectionStrategy, ViewEncapsulation, OnInit } from '@angular/core';
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
import { MatInputModule } from '@angular/material/input';
import { NotificationBannerService } from '../../../shared/notification-banner/notification-banner.service';
import { NotificationBannerComponent } from "../../../shared/notification-banner/notification-banner.component";

@Component({
  selector: 'app-donator-calendar',
  standalone: true,
  imports: [
    MatDatepickerModule, MatCardModule, CommonModule, MatFormFieldModule, 
    MatSelectModule, MatInputModule, FormsModule, ReactiveFormsModule, NotificationBannerComponent
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
  availableDonationHours: string[] = [];
  visible: boolean = false;

  constructor(
    private donationService: DonationService,
    private authService: AuthService,
    private notificationService: NotificationBannerService
  ) {}

  ngOnInit(): void {
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
    if (!d || this.availableDates.length === 0) return false;
    const day = this.normalize(d);
    return this.availableDates.some(date => this.normalize(date).getTime() === day.getTime());
  };

  private normalize(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  // Quando muda o banco
  onSelectBloodBankChange(bloodBankId: string) {
    this.selectedBloodBankId = bloodBankId;
    this.scheduleForm.get('selectedDate')?.reset();
    this.scheduleForm.get('donationTime')?.reset();
    this.selectedDate = null;
    this.availableDates = [];
    this.availableDonationHours = [];

    this.donationService.getAvailableDonationDates(bloodBankId).subscribe({
      next: dates => {
        this.availableDates = dates.map(d => new Date(d.date));
      },
      error: () => this.availableDates = []
    });
  }

  // Quando o usuário seleciona uma data
  onDateSelected(date: Date | null) {
    if (!date || !this.selectedBloodBankId) return;
    this.selectedDate = date;
    this.scheduleForm.get('donationTime')?.reset();
    this.availableDonationHours = [];

    const dateString = date.toISOString().split('T')[0]; // 'yyyy-MM-dd'
    this.donationService.getAvailableDonationHours(this.selectedBloodBankId, dateString)
      .subscribe({
        next: slots => this.availableDonationHours = slots.map(s => s.time.substring(0, 5)),
        error: () => this.availableDonationHours = []
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
    };

    this.donationService.scheduleDonation(appointment).subscribe({
      next: () => this.notificationService.show('Agendamento realizado com sucesso', 'success', 3000),
      error: () => this.notificationService.show('Erro ao realizar agendamento!', 'error', 3000)
    });
  }

}
