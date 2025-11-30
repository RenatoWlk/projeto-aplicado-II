import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderService } from '../header/header.service';
import { UserRole } from '../../shared/app.enums';
import { AppRoutesPaths } from '../../shared/app.constants';
import { QuestionnaireService } from '../../pages/questionnaire/questionnaire.service';
import { NotificationBannerService } from '../../shared/notification-banner/notification-banner.service';

@Component({
  selector: 'app-subheader',
  imports: [CommonModule, RouterModule],
  templateUrl: './subheader.component.html',
  styleUrl: './subheader.component.scss'
})
export class SubheaderComponent {
  constructor(private headerService: HeaderService, private questionnaireService: QuestionnaireService,
    private notificationService: NotificationBannerService,
  ) {}

  readonly roles = UserRole;
  readonly appRoutesPaths = AppRoutesPaths;
  @Input() userRole: UserRole | null = null;
  isEligible: boolean = false;
  showScheduling: boolean = false;

  changeSlogan() {
    this.headerService.triggerSloganChange();
  }
}
