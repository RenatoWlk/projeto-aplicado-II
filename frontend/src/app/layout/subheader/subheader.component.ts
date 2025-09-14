import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderService } from '../header/header.service';
import { UserRole } from '../../shared/app.enums';

@Component({
  selector: 'app-subheader',
  imports: [CommonModule, RouterModule],
  templateUrl: './subheader.component.html',
  styleUrl: './subheader.component.scss'
})
export class SubheaderComponent {
  constructor(private headerService: HeaderService) {}

  readonly roles = UserRole;
  @Input() userRole: UserRole | null = null;

  changeSlogan() {
    this.headerService.triggerSloganChange();
  }
}
