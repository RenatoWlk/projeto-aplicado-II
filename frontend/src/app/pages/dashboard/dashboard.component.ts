import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardConstants } from './constants/dashboard.constants';
import { UserStats, Bloodbank, Campaign, DashboardService, Offer } from './dashboard.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { RouterModule } from '@angular/router';
import { UserRole } from '../../shared/app.enums';
import { BloodbankDashboardComponent } from './bloodbank-dashboard/bloodbank-dashboard.component';
import { LeaderboardsComponent } from "./leaderboards/leaderboards.component";
import { PreloaderComponent } from "../../shared/preloader/preloader.component";
import { AppRoutesPaths } from '../../shared/app.constants';
import { PartnerDashboardComponent } from "./partner-dashboard/partner-dashboard.component";
import { QuestionnaireService } from '../questionnaire/questionnaire.service';
import { NotificationBannerService } from '../../shared/notification-banner/notification-banner.service';
import { Subject, takeUntil } from 'rxjs';
import { DonationData } from './bloodbank-dashboard/bloodbank-dashboard.model';
import { UserAccountService } from '../account/user-account/user-account.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,  BloodbankDashboardComponent, LeaderboardsComponent, PreloaderComponent, PartnerDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Constants
  readonly appRoutesPaths = AppRoutesPaths;
  public readonly POSTS_SECTION_TITLE: string = DashboardConstants.POSTS_SECTION_TITLE;
  public readonly OFFERS_SECTION_TITLE: string = DashboardConstants.OFFERS_SECTION_TITLE;
  public readonly NEARBY_BLOODBANKS_SECTION_TITLE: string = DashboardConstants.NEARBY_BLOODBANKS_SECTION_TITLE;
  public readonly STATS_SECTION_TITLE: string = DashboardConstants.STATS_SECTION_TITLE;
  public readonly ACHIEVEMENTS_SECTION_TITLE: string = DashboardConstants.ACHIEVEMENTS_SECTION_TITLE;
  public readonly LOGIN_REQUIRED_MESSAGE: string = DashboardConstants.LOGIN_REQUIRED_MESSAGE;
  private readonly LITERS_PER_DONATION: number = 0.45;

  // User data
  readonly roles = UserRole;
  isLoggedIn: boolean = false;
  userRole: UserRole | null = null;
  private userId: string = "";
  isEligible: boolean = false;
  showTutorial: boolean = false;
  
  // Dashboard data
  posts: Campaign[] = [];
  offers: Offer[] = [];
  nearbyBloodbanks: Bloodbank[] = [];
  userStats: UserStats = {} as any;
  userDonations: DonationData[] = [];
  totalLitersDonated: string = "";

  // Preloaders
  loadingPosts: boolean = true;
  loadingOffers: boolean = true;
  loadingBloodbanks: boolean = true;
  loadingStatsAndAchievements: boolean = true;

  // Subject to manage unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService, 
    private authService: AuthService,
    private userService: UserAccountService,
    private questionnaireService: QuestionnaireService,
    private notificationBannerService: NotificationBannerService,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.userRole = this.authService.getCurrentUserRole();

    if (this.isLoggedIn && this.userRole === this.roles.User) {
      this.userId = this.authService.getCurrentUserId();
      this.loadAllDashboardData();
      this.loadUserQuestionnaire();
    } else {
      this.loadDashboardDataForPublicUsers();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validate the user eligibility to donate/schedule.
   */
  private async loadUserQuestionnaire(): Promise<void> {
    this.questionnaireService.getUserQuestionnaires()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (questionnaireAnswer) => {
        if (questionnaireAnswer && questionnaireAnswer.length > 0) {
          this.showTutorial = false;
        } else {
          this.showTutorial = true;
        }
      },
      error: () => {
        this.notificationBannerService.show('Erro ao carregar eligibilidade do usuário', 'error', 1500);
      }
    });
  }

  /**
   * Loads all required dashboard data for logged users.
   */
  private loadAllDashboardData(): void {
    this.getPosts();
    this.getOffers();
    this.getNearbyBloodbanks();
    this.getUserStats();
    this.getUserDonations();
  }

  /**
   * Loads the dashboard data for public users.
   */
  private loadDashboardDataForPublicUsers(): void {
    this.getPosts();
    this.getOffers();
  }

  /**
   * Fetches campaigns from the server and stores them in the component.
   */
  private getPosts(): void {
    this.dashboardService.getCampaigns()
    .pipe(takeUntil(this.destroy$))
    .subscribe((posts: Campaign[]) => {
      this.posts = posts;
      this.loadingPosts = false;
    });
  }

  /**
   * Fetches offers from the server and stores them in the component.
   */
  private getOffers(): void {
    this.dashboardService.getOffers()
    .pipe(takeUntil(this.destroy$))
    .subscribe((offers: Offer[]) => {
      this.offers = offers;
      this.loadingOffers = false;
    });
  }

  /**
   * Fetches nearby blood banks from the server and stores them in the component.
   */
  private getNearbyBloodbanks(): void {
    this.dashboardService.getNearbyBloodbanks(this.userId)
    .pipe(takeUntil(this.destroy$))
    .subscribe((banks: Bloodbank[]) => {
      this.nearbyBloodbanks = banks;
      this.loadingBloodbanks = false;
    });
  }

  getReadableBloodbankDistance(distance: number): string {
    if (distance < 1) {
      const meters = Math.round(distance * 1000);
      return `${meters} m`;
    } else {
      return `${distance.toFixed(1)} km`;
    }
  }

  /**
   * Fetches user statistics from the server and processes them.
   */
  public getUserStats(): void {
    this.dashboardService.getUserStats(this.userId)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (stats) => {
        stats.achievements = this.sortAchievementsByRarity(stats.achievements);
        stats.potentialLivesSaved = this.calculatePotentialLivesSaved(stats.timesDonated);
        this.totalLitersDonated = this.calculateLitersDonated(stats.timesDonated);
        this.userStats = stats;
        this.loadingStatsAndAchievements = false;
      },
      error: () => {
        this.notificationBannerService.show('Erro ao buscar estatísticas do usuário.', 'error', 1500);
      }
    });
  }

  public getUserDonations(): void {
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => this.loadDonations(user),
      });
  }

  private loadDonations(user: any): void {
    this.dashboardService.getUserDonations(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (donations: DonationData[]) => {
          this.userDonations = donations;
          this.processDonationStats(user);
          this.loadingStatsAndAchievements = false;
        },
        error: () => {
          this.notificationBannerService.show('Erro ao buscar as doações do usuário.', 'error');
          this.loadingStatsAndAchievements = false;
        }
      });
  }

  private processDonationStats(user: any): void {
    const completed = this.getCompletedDonationsSorted();
    const last = completed[0] ?? null;

    const lastDate = last ? new Date(last.updatedAt ?? last.date) : null;
    this.userStats.lastDonationDate = lastDate;

    const intervalDays = user.gender === 'Masculino' ? 90 : 120;

    if (lastDate) {
      this.calculateNextDonation(lastDate, intervalDays);
    } else {
      this.userStats.nextDonationDate = null;
      this.userStats.daysUntilNextDonation = null;
    }
  }

  private getCompletedDonationsSorted(): DonationData[] {
    return this.userDonations
      .filter(d => d.status === 'COMPLETED')
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt ?? a.date).getTime();
        const dateB = new Date(b.updatedAt ?? b.date).getTime();
        return dateB - dateA;
      });
  }

  private calculateNextDonation(lastDate: Date, intervalDays: number): void {
    const next = new Date(lastDate);
    next.setDate(next.getDate() + intervalDays);
    this.userStats.nextDonationDate = next;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextMidnight = new Date(next);
    nextMidnight.setHours(0, 0, 0, 0);

    const diffMs = nextMidnight.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    this.userStats.daysUntilNextDonation = diffDays > 0 ? diffDays : 0;
  }

  /**
   * Returns a human-readable string for the time until the next donation.
   * 
   * @param secondsString The time in seconds until the next donation.
   * @returns A string representing the time in a human-readable format.
   */
  getReadableTimeUntilNextDonation(secondsString: string): string {
    const seconds = parseInt(secondsString);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}min`);

    return parts.length > 0 ? parts.join(' ') : 'Já pode doar';
  }

  /**
   * Calculates how many lives were potentially saved.
   * 
   * @param donations The number of donations made.
   * @returns The number of potential lives saved (total donations * 4).
   */
  private calculatePotentialLivesSaved(donations: number): number {
    return donations > 0 ? donations * 4 : 0;
  }

  /**
   * Sorts achievements by rarity (comum → raro → épico → lendário → mítico).
   * 
   * @param achievements The list of achievements to sort.
   * @returns The sorted list of achievements.
   */
  private sortAchievementsByRarity(achievements: any[]): any[] {
    const order: { [key: string]: number } = {
      comum: 1,
      raro: 2,
      épico: 3,
      lendário: 4,
      mítico: 5
    };

    return achievements.sort((a, b) => order[a.rarity.toLowerCase()] - order[b.rarity.toLowerCase()]);
  }

  calculateLitersDonated(donations: number): string {
    return (donations * this.LITERS_PER_DONATION).toFixed(2).toString() + " Litros";
  }
}
