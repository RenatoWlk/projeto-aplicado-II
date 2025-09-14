import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import {MatCalendar, MatDatepickerModule} from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { CustomHeaderComponent } from './custom-header/custom-header.component';
import { CommonModule } from '@angular/common';
import { BloodbankCalendarComponent } from './bloodbank-calendar/bloodbank-calendar.component';
import { DonatorCalendarComponent } from './donator-calendar/donator-calendar.component';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserRole } from '../../shared/app.enums';


@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [MatDatepickerModule, MatCardModule, CommonModule, BloodbankCalendarComponent, DonatorCalendarComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarComponent {
  readonly customHeader = CustomHeaderComponent;

  readonly roles = UserRole;
  userRole: UserRole | null = null;
  id: string | null = null;

  constructor(
    private authService : AuthService,
  ) {}

  ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();
  }
}

