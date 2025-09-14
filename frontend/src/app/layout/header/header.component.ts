import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { HeaderService } from './header.service';

@Component({
  selector: 'app-header',
  imports: [MatIconModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss',]
})
export class HeaderComponent implements OnInit {
  isMenuOpen: boolean = false;
  isLoggedIn: boolean = false;
  userName: string = 'Renas';
  userEmail: string = 'renas@gmail.com';
  slogan: string = '';

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

  constructor(private authService: AuthService, private headerService: HeaderService, private router: Router) {}

  ngOnInit(): void {
    this.setRandomSlogan();

    this.headerService.sloganTrigger.subscribe(() => {
      this.setRandomSlogan();
    });

    this.isLoggedIn = this.authService.isAuthenticated();

    if (this.isLoggedIn) {
      this.userName = this.authService.getCurrentUserName();
      this.userEmail = this.authService.getCurrentUserEmail();
    }
  }
  
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateTo(path: string) {
    this.isMenuOpen = false;
    this.router.navigate([path]);
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // só fecha se clicar fora do botão/menu
    if (!target.closest('.left')) {
      this.isMenuOpen = false;
    }
  }

  setRandomSlogan() {
    this.slogan = this.slogans[Math.floor(Math.random() * this.slogans.length)];
  }

  logout() {
    this.authService.logout();
  }
}
