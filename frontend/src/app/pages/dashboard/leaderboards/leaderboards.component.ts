import { Component, OnInit } from '@angular/core';
import { TopDonor, TopPointsUser, LeaderboardsService } from './leaderboards.service';
import { CommonModule } from '@angular/common';
import { PreloaderComponent } from "../../../shared/preloader/preloader.component";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'leaderboards',
  imports: [CommonModule, PreloaderComponent],
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.scss']
})
export class LeaderboardsComponent implements OnInit {
  activeTab: 'donors' | 'points' = 'donors';
  isLoadingLeaderboards: boolean = true;

  topDonors: TopDonor[] = [];
  topPoints: TopPointsUser[] = [];

  // Subject to manage unsubscribe
  private destroy$ = new Subject<void>();

  constructor(private leaderboardsService: LeaderboardsService) {}

  ngOnInit(): void {
    this.fetchLeaderboards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchLeaderboards(): void {
    this.leaderboardsService.getLeaderboards()
    .pipe(takeUntil(this.destroy$))
    .subscribe((leaderboards) => {
      this.topDonors = leaderboards.topDonors;
      this.topPoints = leaderboards.topPointsUsers;
      this.isLoadingLeaderboards = false;
    });
  }
}
