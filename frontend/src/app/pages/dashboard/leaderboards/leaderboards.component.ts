import { Component, OnInit } from '@angular/core';
import { TopDonor, TopPointsUser, LeaderboardsService } from './leaderboards.service';
import { CommonModule } from '@angular/common';
import { PreloaderComponent } from "../../../shared/preloader/preloader.component";

@Component({
  selector: 'app-leaderboards',
  imports: [CommonModule, PreloaderComponent],
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.scss']
})
export class LeaderboardsComponent implements OnInit {
  activeTab: 'donors' | 'points' = 'donors';
  isLoadingLeaderboards: boolean = true;

  topDonors: TopDonor[] = [];
  topPoints: TopPointsUser[] = [];

  constructor(private leaderboardsService: LeaderboardsService) {}

  ngOnInit(): void {
    this.fetchLeaderboards();
  }

  fetchLeaderboards(): void {
    this.leaderboardsService.getLeaderboards().subscribe((leaderboards) => {
      this.topDonors = leaderboards.topDonors;
      this.topPoints = leaderboards.topPointsUsers;
      this.isLoadingLeaderboards = false;
    });
  }
}
