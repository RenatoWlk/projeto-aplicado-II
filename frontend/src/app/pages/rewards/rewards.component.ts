import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RewardsService, Reward, RewardsResponse } from './rewards.service';
import { NotificationBannerService } from '../../shared/notification-banner/notification-banner.service';

@Component({
  selector: 'rewards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.scss']
})
export class RewardsComponent implements OnInit {
  userPoints = 0;
  query = '';
  filter: 'all' | 'available' | 'redeemed' = 'all';

  isModalOpen = false;
  selectedReward: Reward | null = null;

  rewards: Reward[] = [];
  isLoading = false;

  constructor(
    private rewardsService: RewardsService, 
    private notificationService: NotificationBannerService,
  ) {}

  ngOnInit(): void {
    this.loadRewards();
  }

  private async loadRewards(): Promise<void> {
    this.isLoading = true;

    this.rewardsService.getRewards().subscribe({
      next: async (res) => {
        if (!Array.isArray(res) && (res as RewardsResponse).rewards !== undefined) {
          const response = res as RewardsResponse;
          this.userPoints = response.userPoints ?? 0;
          this.rewards = response.rewards ?? [];
        } else {
          const rewardsArray = res as Reward[];
          this.rewards = rewardsArray ?? [];
        }

        this.isLoading = false;
      },
      error: () => {
        this.notificationService.show('Erro ao tentar carregar recompensas.\nTente novamente mais tarde', 'error', 1500);
        this.isLoading = false;
      }
    });
  }

  get visibleRewards(): Reward[] {
    return this.rewards
      .filter(r => {
        const matchesQuery =
          this.query.trim() === '' ||
          (r.title + ' ' + r.partnerName + ' ' + r.description)
            .toLowerCase()
            .includes(this.query.toLowerCase());

        if (!matchesQuery) return false;

        if (this.filter === 'available') return !r.redeemed && r.stock > 0;
        if (this.filter === 'redeemed') return !!r.redeemed;
        return true;
      })
      .sort((a, b) => b.requiredPoints - a.requiredPoints);
  }

  openRedeemModal(reward: Reward) {
    this.selectedReward = reward;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedReward = null;
  }

  confirmRedeem() {
    if (!this.selectedReward) return;

    const rewardId = this.selectedReward.id;

    this.rewardsService.redeemReward(rewardId).subscribe({
      next: () => {
        this.loadRewards();
        this.closeModal();
      },
      error: (err) => {
        console.error('Redeem failed', err);
        this.closeModal();
      }
    });
  }

  canRedeem(reward: Reward): boolean {
    return (
      !reward.redeemed &&
      reward.stock > 0 &&
      reward.requiredPoints <= this.userPoints
    );
  }

  formatPoints(points: number): string {
    return points.toLocaleString('pt-BR');
  }
}
