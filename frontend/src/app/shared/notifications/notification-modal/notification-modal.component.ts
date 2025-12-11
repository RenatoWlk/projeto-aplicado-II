import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../modal/modal.component';
import { PreloaderComponent } from '../../preloader/preloader.component';
import { NotificationDto } from '../notifications.model';
import { NotificationService } from '../notifications.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { AppRoutesPaths } from '../../app.constants';
import { HeaderComponent } from '../../../layout/header/header.component';
import { NotificationEventService } from '../notification-event.service';

@Component({
  selector: 'notification-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, PreloaderComponent],
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() userId = '';
  @Output() close = new EventEmitter<void>();

  private typeLabels: Record<string, string> = {
    OFFERS: 'Ofertas',
    CAMPAIGNS: 'Campanhas',
    ACHIEVEMENT: 'Conquista',
    DONATION: 'Doação',
  };

  private redirectMap: Record<string, string> = {
    dashboard: AppRoutesPaths.DASHBOARD,
    rewards: AppRoutesPaths.REWARDS,
    calendar: AppRoutesPaths.CALENDAR,
    account: AppRoutesPaths.ACCOUNT,
  };

  activeTab: 'unread' | 'all' = 'unread';
  notifications: NotificationDto[] = [];
  filtered: NotificationDto[] = [];
  selected?: NotificationDto;
  isLoading = false;
  unreadCount = 0;
  searchTerm = '';
  typeFilter = 'all';

  private destroy$ = new Subject<void>();
  private search$ = new Subject<string>();

  constructor(private notificationService: NotificationService, private router: Router, private notificationEventService: NotificationEventService) {
    this.search$.pipe(debounceTime(180), takeUntil(this.destroy$)).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }

  ngOnChanges(): void {
    if (this.visible && this.userId) {
      this.refreshAll();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // refresh both notifications + unread badge
  refreshAll(): void {
    this.loadUnreadCount();
    this.loadNotifications();
    this.notificationEventService.emitRefresh();
  }

  loadUnreadCount(): void {
    if (!this.userId) return;
    this.notificationService.getUnreadCount(this.userId)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: count => this.unreadCount = count, 
        error: () => this.unreadCount = 0,
      });
  }

  loadNotifications(): void {
    if (!this.userId) return;
    this.isLoading = true;
    this.notificationService.getNotifications(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: list => {
          // sort descending by createdAt
          this.notifications = list.sort((a,b) => (new Date(b.createdAt || '').getTime()) - (new Date(a.createdAt || '').getTime()));
          this.applyFilters();
          this.isLoading = false;
        },
        error: () => {
          this.notifications = [];
          this.filtered = [];
          this.isLoading = false;
        }
      });
  }

  selectTab(tab: 'unread' | 'all'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  onSearch(term: string): void {
    this.search$.next(term);
  }

  onSelectType(type: string): void {
    this.typeFilter = type;
    this.applyFilters();
  }

  applyFilters(): void {
    let list = [...this.notifications];

    if (this.activeTab === 'unread') {
      list = list.filter(n => !n.read);
    }

    if (this.typeFilter !== 'all') {
      list = list.filter(n => n.type === this.typeFilter);
    }

    if (this.searchTerm && this.searchTerm.trim().length > 0) {
      const q = this.searchTerm.toLowerCase().trim();
      list = list.filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q) ||
        JSON.stringify(n.metadata || {}).toLowerCase().includes(q)
      );
    }

    this.filtered = list;
  }

  openNotification(n: NotificationDto): void {
    this.selected = n;

    if (!n.read) {
      // optimistic update: mark UI as read immediately
      n.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.notificationService.markRead(this.userId, n.notificationBaseId).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.notificationEventService.emitRefresh();
          this.loadUnreadCount();
        },
        error: () => {
          n.read = false;
          this.loadUnreadCount();
        }
      });
    }
  }

  redirectSelected(): void {
    if (!this.selected?.redirectTo) return;

    const key = this.selected.redirectTo.toLowerCase();
    const route = this.redirectMap[key];

    if (route) {
      this.router.navigateByUrl(route);
      this.onClose();
    }
  }

  markRead(): void {
    if (!this.userId || !this.selected || this.selected.read) return;

    this.notificationService.markRead(this.userId, this.selected.notificationBaseId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.loadNotifications();
        this.loadUnreadCount();
      },
      error: () => {
        this.loadNotifications();
        this.loadUnreadCount();
      }
    });
  }

  markAllRead(): void {
    if (!this.userId) return;
    if (!confirm('Marcar todas as notificações como lidas?')) return;

    this.notificationService.markAllRead(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // update UI
          this.notifications.forEach(n => n.read = true);
          this.applyFilters();
          this.unreadCount = 0;
        },
        error: () => {
          // fallback: reload
          this.loadNotifications();
          this.loadUnreadCount();
        }
      });
  }

  // small helper to show relative time
  timeAgo(iso?: string): string {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  }

  getTypeLabel(type?: string): string {
    if (!type) return 'N/A';
    return this.typeLabels[type] || type;
  }

  trackById(_i: number, item: NotificationDto) {
    return item.notificationBaseId;
  }

  onClose(): void {
    this.close.emit();
  }

  // helper to get distinct types available for filter
  getAvailableTypes(): string[] {
    const set = new Set<string>();
    this.notifications.forEach(n => { if (n.type) set.add(n.type); });
    return Array.from(set);
  }

  // small utility to test expiration
  isExpired(n: NotificationDto): boolean {
    return !!n.expireAt && new Date(n.expireAt).getTime() < Date.now();
  }
}
