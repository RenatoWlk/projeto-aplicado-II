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
import { FormGroup, FormControl, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core'; 
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth/auth.service';
import { NotificationBannerService } from '../../../shared/notification-banner/notification-banner.service';
import { Subject, takeUntil } from 'rxjs';

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
  
  // Subject to manage unsubscribe
  private destroy$ = new Subject<void>();
  
  calendarStats : CalendarStats = {
    lastDonationDate : new Date(),
    nextDonationDate : new Date(),
    daysUntilNextDonation : 0,
  }

  rangeForm = new FormGroup({
    startDate: new FormControl<Date>(new Date(), {nonNullable: true}),
    endDate: new FormControl<Date>(new Date(), {nonNullable: true}),
    startTime: new FormControl<string>('08:00', {
      nonNullable: true,
      validators: [this.timeRangeValidator('08:00', '17:00')]
    }),
    endTime: new FormControl<string>('17:00', {
      nonNullable: true,
      validators: [this.timeRangeValidator('08:00', '17:00')]
    }),
    availableSpots: new FormControl<number>(0, {nonNullable: true}),
  }, { validators: this.endTimeAfterStartTimeValidator() });

  constructor(
    private bloodbankService: BloodbankService,
    private authService: AuthService,
    private notificationService: NotificationBannerService,
  ) {
    // Escutar mudanças no startTime para revalidar endTime
    this.rangeForm.controls.startTime.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.rangeForm.controls.endTime.updateValueAndValidity();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Validator para limitar o horário entre min e max
  private timeRangeValidator(minTime: string, maxTime: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const timeStr = this.toTimeString(value);
      if (!timeStr) return null;

      const [hours, minutes] = timeStr.split(':').map(Number);
      const [minH, minM] = minTime.split(':').map(Number);
      const [maxH, maxM] = maxTime.split(':').map(Number);

      const currentMinutes = hours * 60 + minutes;
      const minMinutes = minH * 60 + minM;
      const maxMinutes = maxH * 60 + maxM;

      if (currentMinutes < minMinutes || currentMinutes > maxMinutes) {
        return { timeRange: { min: minTime, max: maxTime, actual: timeStr } };
      }

      return null;
    };
  }

  // Validator para garantir que endTime é depois de startTime
  private endTimeAfterStartTimeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const formGroup = group as FormGroup;
      const startTime = formGroup.get('startTime')?.value;
      const endTime = formGroup.get('endTime')?.value;

      if (!startTime || !endTime) return null;

      const startStr = this.toTimeString(startTime);
      const endStr = this.toTimeString(endTime);

      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (endMinutes <= startMinutes) {
        // Adicionar erro específico no controle endTime
        formGroup.get('endTime')?.setErrors({ endTimeBeforeStart: true });
        return { endTimeBeforeStart: true };
      } else {
        // Remover erro se a validação passou
        const endTimeControl = formGroup.get('endTime');
        if (endTimeControl?.hasError('endTimeBeforeStart')) {
          endTimeControl.setErrors(null);
        }
      }

      return null;
    };
  }

  addAvailableSlots() {
    // Validar o formulário antes de enviar
    if (this.rangeForm.invalid) {
      if (this.rangeForm.get('startTime')?.hasError('timeRange')) {
        this.notificationService.show('Horário inicial deve estar entre 08:00 e 17:00!', "error", 3000);
        return;
      }
      if (this.rangeForm.get('endTime')?.hasError('timeRange')) {
        this.notificationService.show('Horário final deve estar entre 08:00 e 17:00!', "error", 3000);
        return;
      }
      if (this.rangeForm.hasError('endTimeBeforeStart') || this.rangeForm.get('endTime')?.hasError('endTimeBeforeStart')) {
        this.notificationService.show('Horário final deve ser depois do horário inicial!', "error", 3000);
        return;
      }
      this.notificationService.show('Preencha o formulário corretamente!', "error", 3000);
      return;
    }

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

    this.bloodbankService.addAvailableSlots(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
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