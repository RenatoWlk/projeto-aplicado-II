import { Component, DestroyRef, inject } from '@angular/core';
import { AchievementsService } from '../../shared/achievements.service';
import { NotificationService } from '../../shared/notifications/notifications.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Achievement, DashboardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'scrt',
  imports: [],
  templateUrl: './scrt.component.html',
  styleUrl: './scrt.component.scss'
})
export class ScrtComponent {
  private destroyRef = inject(DestroyRef);

  constructor(
    private auth: AuthService,
    private achievementsService: AchievementsService,
    private notificationService: NotificationService,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    const userId = this.auth.getCurrentUserId();

    this.dashboardService.getUserStats(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(stats => {
      let alreadyUnlocked = false;

      stats.achievements.forEach(achievement => {
        if (achievement.title === 'Segredinho') {
          alreadyUnlocked = true;
        }
      });

      if (!alreadyUnlocked) {
        this.achievementsService.unlockScrtAchievement().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
        this.notificationService.activateForUser(userId, "achievement_secret_found", 72)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      }
    });
  }
}
