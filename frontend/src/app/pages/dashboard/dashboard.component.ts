import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardConstants } from './constants/dashboard.constants';
import { UserStats, Bloodbank, Campaign, DashboardService, Offer } from './dashboard.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { RouterModule } from '@angular/router';
import { UserRole } from '../../shared/app.enums';
import { ModalComponent } from '../../shared/modal/modal.component';
import { FormCreateItemComponent } from '../../shared/form-create-item/form-create-item.component';
import { BloodbankDashboardComponent } from './bloodbank-dashboard/bloodbank-dashboard.component';
import { LeaderboardsComponent } from "./leaderboards/leaderboards.component";
import { PreloaderComponent } from "../../shared/preloader/preloader.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, FormCreateItemComponent, BloodbankDashboardComponent, LeaderboardsComponent, PreloaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Constants
  postsSectionTitle: string = DashboardConstants.POSTS_SECTION_TITLE;
  offersSectionTitle: string = DashboardConstants.OFFERS_SECTION_TITLE;
  nearbyBloodbanksSectionTitle: string = DashboardConstants.NEARBY_BLOODBANKS_SECTION_TITLE;
  statsSectionTitle: string = DashboardConstants.STATS_SECTION_TITLE;
  achievementsSectionTitle: string = DashboardConstants.ACHIEVEMENTS_SECTION_TITLE;
  loginRequiredMessage: string = DashboardConstants.LOGIN_REQUIRED_MESSAGE;

  // User data
  readonly roles = UserRole;
  isLoggedIn: boolean = false;
  userRole: UserRole | null = null;
  private userId: string = "";
  
  // Dashboard data
  posts: Campaign[] = [];
  offers: Offer[] = [];
  nearbyBloodbanks: Bloodbank[] = [];
  userStats: UserStats = {} as any;
  isOfferModalOpen: boolean = false;
  totalLitersDonated: string = "";

  // Preloaders
  loadingPosts: boolean = true;
  loadingOffers: boolean = true;
  loadingBloodbanks: boolean = true;
  loadingStatsAndAchievements: boolean = true;

  constructor(private dashboardService: DashboardService, private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.userRole = this.authService.getCurrentUserRole();

    if (this.isLoggedIn && this.userRole === this.roles.User) {
      this.userId = this.authService.getCurrentUserId();
      this.loadAllDashboardData();
    } else {
      this.loadDashboardDataForPublicUsers();
    }
  }

  /**
   * Loads all required dashboard data for logged users.
   */
  private loadAllDashboardData(): void {
    this.getPosts();
    this.getOffers();
    this.getNearbyBloodbanks();
    this.getUserStats();
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
    this.dashboardService.getCampaigns().subscribe((posts: Campaign[]) => {
      this.posts = posts;
      this.loadingPosts = false;
    });
  }

  /**
   * Fetches offers from the server and stores them in the component.
   */
  private getOffers(): void {
    this.dashboardService.getOffers().subscribe((offers: Offer[]) => {
      this.offers = offers;
      this.loadingOffers = false;
    });
  }

  /**
   * Fetches nearby blood banks from the server and stores them in the component.
   */
  private getNearbyBloodbanks(): void {
    this.dashboardService.getNearbyBloodbanks(this.userId).subscribe((banks: Bloodbank[]) => {
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
    this.dashboardService.getUserStats(this.userId).subscribe((stats: UserStats) => {
      stats.achievements = this.sortAchievementsByRarity(stats.achievements);
      stats.potentialLivesSaved = this.calculatePotentialLivesSaved(stats.timesDonated);
      stats.timeUntilNextDonation = this.getReadableTimeUntilNextDonation(stats.timeUntilNextDonation);
      this.totalLitersDonated = this.calculateLitersDonated(stats.timesDonated);
      this.userStats = stats;
      this.loadingStatsAndAchievements = false;
    });
  }

  /**
   * Returns a human-readable string for the time until the next donation.
   * 
   * @param secondsString - The time in seconds until the next donation.
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
   * @param donations - The number of donations made.
   * @returns The number of potential lives saved (total donations * 4).
   */
  private calculatePotentialLivesSaved(donations: number): number {
    return donations > 0 ? donations * 4 : 0;
  }

  /**
   * Sorts achievements by rarity (comum → raro → épico → lendário → mítico).
   * 
   * @param achievements - The list of achievements to sort.
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
    const LITERS_PER_DONATION = 0.45;
    return +(donations * LITERS_PER_DONATION).toFixed(2).toString() + " Litros";
  }


  createNewOffer(data: any): void {
    this.isOfferModalOpen = false;

    this.dashboardService.createOffer(data).subscribe(() => {
      this.getOffers();
    });
  }
}
