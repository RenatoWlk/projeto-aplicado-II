import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { HeaderService } from './header.service';
import { AppRoutesPaths } from '../../shared/app.constants';
import { NotificationModalComponent } from '../../shared/notifications/notification-modal/notification-modal.component';
import { NotificationEventService } from '../../shared/notifications/notification-event.service';
import { UserRole } from '../../shared/app.enums';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, CommonModule, RouterModule, NotificationModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  readonly appRoutesPaths = AppRoutesPaths;
  readonly roles = UserRole;
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  userName: string = '';
  userEmail: string = '';
  userRole: UserRole | null = null;
  slogan: string = '';
  currentUserId: string = '';

  isNotificationsOpen = false;
  unreadCount = 0;

  // Subject to manage unsubscribe
  private destroy$ = new Subject<void>();

  private slogans: string[] = [
    'Uma doação pode salvar até 4 vidas!',
    'Doe sangue, salve vidas!',
    'Cada gota conta!',
    'Seja o herói de alguém hoje!',
    'Você pode ser a diferença entre a vida e a morte!',
    'Compartilhe vida, doe sangue!',
    'Doe sangue, espalhe esperança!',
    'Salve uma vida em menos de 30 minutos!',
    'Seu sangue é um presente que vale vidas!',
    'Doe hoje. Alguém precisa agora.',
    'Ajude quem não tem tempo a esperar.',
    'Seu gesto simples pode ser tudo para alguém!',
    'A vida continua com a sua doação!',
    'Um pequeno ato, um grande impacto!'
  ];

  constructor(
    private authService: AuthService,
    private headerService: HeaderService,
    private router: Router,
    private notificationEventService: NotificationEventService,
  ) {}

  ngOnInit(): void {
    this.setRandomSlogan();

    this.headerService.sloganTrigger
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.setRandomSlogan());

    this.isLoggedIn = this.authService.isAuthenticated();
    if (!this.isLoggedIn) return;

    this.userName = this.authService.getCurrentUserName();
    this.userEmail = this.authService.getCurrentUserEmail();
    this.userRole = this.authService.getCurrentUserRole();
    this.currentUserId = this.authService.getCurrentUserId();

    this.loadHeaderUnreadCount();

    this.notificationEventService.refresh$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.loadHeaderUnreadCount();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHeaderUnreadCount() {
    this.headerService.getNotificationsUnreadCount(this.currentUserId)
    .pipe(takeUntil(this.destroy$))
    .subscribe(count => {
      this.unreadCount = count;
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleNotifications(event?: MouseEvent) {
    event?.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  navigateTo(path: string) {
    this.isMenuOpen = false;
    this.router.navigate([path]);
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.left')) {
      this.isMenuOpen = false;
    }

    // close notifications if click outside and modal isn't open
    if (!target.closest('.notification-btn') && !target.closest('notification-modal')) {
      this.isNotificationsOpen = false;
    }
  }

  setRandomSlogan() {
    this.slogan = this.slogans[Math.floor(Math.random() * this.slogans.length)];
  }

  logout() {
    this.authService.logout();
  }
}
