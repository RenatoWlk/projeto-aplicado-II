import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { SubheaderComponent } from './subheader/subheader.component';
import { CommonModule } from '@angular/common';
import { UserRole } from '../shared/app.enums';
import { AuthService } from '../core/services/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [HeaderComponent, FooterComponent, MatIconModule, RouterModule,
    SubheaderComponent, CommonModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss',]
})
export class LayoutComponent implements OnInit{
  userRole: UserRole | null = null;
  readonly roles = UserRole;
  
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userRole = this.authService.getCurrentUserRole();
  }
}
