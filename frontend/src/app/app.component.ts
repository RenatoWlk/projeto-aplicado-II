import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationBannerComponent } from './shared/notification-banner/notification-banner.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, NotificationBannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss',]
})
export class AppComponent {

}
