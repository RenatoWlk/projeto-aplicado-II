import { Component, Input, OnInit } from '@angular/core';
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
export class SubheaderComponent implements OnInit {
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

  ngOnInit(): void {
    this.loadUserQuestionnaire();
  }


  private async loadUserQuestionnaire(): Promise<void> {
    this.questionnaireService.getUserQuestionnaires().subscribe({
      next: (questionnaireAnswer) => {
        if (questionnaireAnswer && questionnaireAnswer.length > 0) {
          this.isEligible = questionnaireAnswer[0].eligible;
          if (this.isEligible === true) {
            this.showScheduling = true;
          } else {
            this.showScheduling = false;
          }
          console.log(this.isEligible);
        }
      },
      error: () => {
        this.notificationService.show('Erro', 'error', 1500);
      }
    });
}

}
