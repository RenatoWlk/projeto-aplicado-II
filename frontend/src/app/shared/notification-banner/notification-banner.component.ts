import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { NotificationBannerService } from './notification-banner.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-banner.component.html',
  styleUrls: ['./notification-banner.component.scss']
})
export class NotificationBannerComponent implements OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'warning' | 'error' = 'success';
  @Input() duration: number = 5000;

  visible = false;
  fadingOut = false;

  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationBannerService) {}

  ngOnInit(): void {
    this.notificationService.notification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        this.message = notification.message;
        this.type = notification.type;
        this.visible = true;
        this.fadingOut = false;

        setTimeout(() => {
          this.fadingOut = true;
          setTimeout(() => {
            this.visible = false;
          }, 500); 
        }, notification.duration || this.duration);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get bannerClass(): string {
    return `banner-${this.type} ${this.fadingOut ? 'fade-out' : 'fade-in'}`;
  }
}
