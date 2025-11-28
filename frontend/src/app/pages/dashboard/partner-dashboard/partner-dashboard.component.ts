import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../../../shared/modal/modal.component";
import { FormCreateItemComponent } from "../../../shared/form-create-item/form-create-item.component";
import { PreloaderComponent } from "../../../shared/preloader/preloader.component";
import { NotificationBannerService } from '../../../shared/notification-banner/notification-banner.service';
import { PartnerDashboardService } from './partner-dashboard.service';
import { Offer } from '../dashboard.service';
import { Reward } from '../../rewards/rewards.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'partner-dashboard',
  imports: [
    CommonModule,
    ModalComponent,
    FormCreateItemComponent,
    PreloaderComponent
  ],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.scss'
})
export class PartnerDashboardComponent implements OnInit {
  partnerOffers: Offer[] = [];
  partnerRewards: Reward[] = [];

  isOfferModalOpen = false;
  isRewardModalOpen = false;

  isLoadingOffers = true;
  isLoadingRewards = true;

  isDeleteModalOpen = false;
  deleteType: 'offer' | 'reward' | null = null;
  itemToDelete: any = null;

  private partnerId: string = "";

  constructor(
    private authService: AuthService,
    private partnerDashboardService: PartnerDashboardService,
    private notificationService: NotificationBannerService,
  ) {}

  ngOnInit(): void {
    this.partnerId = this.authService.getCurrentUserId();
    this.loadOffers();
    this.loadRewards();
  }

  private loadOffers(): void {
    this.partnerDashboardService.getPartnerOffers(this.partnerId)
      .subscribe((offers) => {
        this.partnerOffers = offers;
        this.isLoadingOffers = false;
      });
  }

  private loadRewards(): void {
    this.partnerDashboardService.getPartnerRewards(this.partnerId)
      .subscribe((rewards) => {
        this.partnerRewards = rewards;
        this.isLoadingRewards = false;
      });
  }

  createNewOffer(data: any): void {
    this.isOfferModalOpen = false;

    this.partnerDashboardService.createOffer(data).subscribe(() => {
      this.notificationService.show('Oferta criada com sucesso!', 'success', 1500);
      this.loadOffers();
    });
  }

  createNewReward(data: any): void {
    this.isRewardModalOpen = false;

    this.partnerDashboardService.createReward(data).subscribe(() => {
      this.notificationService.show('Recompensa criada com sucesso!', 'success', 1500);
      this.loadRewards();
    });
  }

  openDeleteModal(type: 'offer' | 'reward', item: any) {
    this.deleteType = type;
    this.itemToDelete = item;
    this.isDeleteModalOpen = true;
  }

  confirmDelete() {
    if (!this.deleteType || !this.itemToDelete) return;

    if (this.deleteType === 'offer') {
      this.partnerDashboardService.deleteOffer(this.itemToDelete.id)
      .subscribe({
          next: () => {
            this.notificationService.show('Oferta excluída!', 'success', 1500);
            this.loadOffers();
          },
          error: () => {
            this.notificationService.show('Erro ao excluir oferta.', 'error', 1500);
          }
        });
    } else {
      this.partnerDashboardService.deleteReward(this.itemToDelete.id)
        .subscribe({
          next: () => {
            this.notificationService.show('Recompensa excluída!', 'success', 1500);
            this.loadRewards();
          },
          error: () => {
            this.notificationService.show('Erro ao excluir recompensa.', 'error', 1500);
          }
        });
    }

    this.isDeleteModalOpen = false;
  }
}
