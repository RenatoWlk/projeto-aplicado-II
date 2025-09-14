import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CustomHeaderComponent } from '../custom-header/custom-header.component';
import { CalendarStats } from '../calendar.service';
import { BloodbankService, DonationSlots } from './bloodbank-calendar.service';
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

@Component({
  selector: 'app-bloodbank-calendar',
  imports: [MatDatepickerModule, MatCardModule, CommonModule, MatFormFieldModule, MatDateRangeInput, MatTimepickerModule, ReactiveFormsModule, MatInputModule,
    MatFormFieldModule,
  ],
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
  });


  constructor(
    private bloodbankService: BloodbankService,
    private authService: AuthService
  ) {}


  addAvailableSlots() {
    const id = this.authService.getCurrentUserId();
    console.log(`id: ${id}`);

    if (!this.rangeForm.value.startDate || !this.rangeForm.value.endDate ||
      !this.rangeForm.value.startTime || !this.rangeForm.value.endTime) {
      //banner de erro
      return;
    }

    const slot: DonationSlots = {
      id: id,
      startDate: this.rangeForm.controls.startDate.value,
      endDate: this.rangeForm.controls.endDate.value,
      startTime: this.rangeForm.controls.startTime.value?.toString().substring(16, 24),
      endTime: this.rangeForm.controls.endTime.value?.toString().substring(16, 24)
    }

    this.bloodbankService.addAvailableSlots(slot).subscribe(() => {
      console.log("Disponibilidade salva com sucesso");
    })
  }
}
