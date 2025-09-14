import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth/auth.service';
import { UserAccountComponent } from './user-account/user-account.component';
import { BloodBankAccountComponent } from './bloodbank-account/bloodbank-account.component';
import { PartnerAccountComponent } from './partner-account/partner-account.component';
import { UserRole } from '../../shared/app.enums';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserAccountComponent,
    BloodBankAccountComponent,
    PartnerAccountComponent
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  userRole: UserRole | null = null;
  readonly roles = UserRole;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getCurrentUserRole();
  }
}
