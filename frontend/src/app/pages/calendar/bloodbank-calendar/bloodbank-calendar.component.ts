import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { CustomHeaderComponent } from '../custom-header/custom-header.component';
import { CalendarStats } from '../calendar.service';
import { BloodbankService } from './bloodbank-calendar.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDateRangeInput } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core'; 
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationBannerService } from '../../../shared/notification-banner/notification-banner.service';

@Component({
  selector: 'app-bloodbank-calendar',
  imports: [MatDatepickerModule, MatCardModule, CommonModule, MatFormFieldModule, MatDateRangeInput, MatTimepickerModule, ReactiveFormsModule, 
    MatInputModule,
    MatFormFieldModule],
  templateUrl: './bloodbank-calendar.component.html',
  styleUrl: './bloodbank-calendar.component.scss',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})

export class BloodbankCalendarComponent {

  readonly customHeader = CustomHeaderComponent;
  selected: Date = new Date();

  calendarStats : CalendarStats = {
    lastDonationDate : new Date(),
    nextDonationDate : new Date(),
    daysUntilNextDonation : 0,
  }

  rangeForm = new FormGroup({
    startDate: new FormControl<Date>(new Date(), {nonNullable: true}),
    endDate: new FormControl<Date>(new Date(), {nonNullable: true}),
    startTime: new FormControl<string>('08:00', {nonNullable: true}),
    endTime: new FormControl<string>('17:00', {nonNullable: true}),
    availableSpots: new FormControl<number>(0, {nonNullable: true}),
  });

  constructor(
    private bloodbankService: BloodbankService,
    private authService: AuthService,
    private notificationService: NotificationBannerService,
  ) {}

  addAvailableSlots() {
    const id = this.authService.getCurrentUserId();
    const startDate = this.rangeForm.controls.startDate.value!;
    const endDate = this.rangeForm.controls.endDate.value!;
    const startTime = this.rangeForm.controls.startTime.value!;
    const endTime = this.rangeForm.controls.endTime.value!;
    const availableSpots = this.rangeForm.controls.availableSpots.value!;


    if (availableSpots <= 0) {
      this.notificationService.show('Erro ao disponibilizar datas, preencha corretamente o número de vagas!', "error", 3000);
      return;
    }

    const slotsByDate = this.generateSlotsByDate(startDate, endDate, startTime, endTime, availableSpots)
    const payload = {id: id, availabilitySlots: slotsByDate};

    this.bloodbankService.addAvailableSlots(payload).subscribe({
      next: () => {
        this.notificationService.show('Datas disponibilizadas com sucesso!', "success", 3000);
      },
      error: (err) => {
        this.notificationService.show('Erro ao disponibilizar datas', "error", 3000);
      }
    });

  }

  private toTimeString(value: Date | string): string {
    if (typeof value === 'string') return value;
    if (value instanceof Date) {
      const time = value.toTimeString().slice(0, 5);
      return time;
    }
    return '';
  }

  private generateDailySlots(startTime: string, endTime: string, availableSpots: number) {
    const slots: {time: string, availableSpots: number}[] = [];
    const [hStart, mStart] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let h = hStart;
    let m = mStart;

    while (h < endH || (h === endH && m <= endM)) {
      slots.push(
        {time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
         availableSpots});
      m += 30;
      if (m >= 60) {
        m = 0;
        h += 1;
      }
    }
    return slots;
  }

  private generateSlotsByDate(startDate: Date, endDate: Date, startTime: string, endTime: string, availableSpots: number) {
    const result: {date: string, slots: {time: string, availableSpots: number}[] }[] = [];

    let current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = current.toISOString().substring(0, 10);
      const start = this.toTimeString(startTime);
      const end = this.toTimeString(endTime);
      const dailySlots = this.generateDailySlots(start, end, availableSpots);
      result.push({date: dateStr, slots: dailySlots});
      current.setDate(current.getDate() + 1);
    }
    return result;
  }
}
