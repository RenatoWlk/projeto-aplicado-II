import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';
import { NotificationBannerService } from '../../shared/notification-banner/notification-banner.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationBannerService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  login() {
    if (this.loginForm.invalid) {
      this.notificationService.show('Preencha todos os campos corretamente', 'error', 3000);
      return;
    }

    const email = this.loginForm.value.email.trim();
    const password = this.loginForm.value.password;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.notificationService.show('Login realizado com sucesso!', 'success', 3000);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 3500);      
      },
      error: (err) => {
        this.notificationService.show('Email ou senha inválidos!', 'error', 3000);
      }
    });

  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.loginForm.get(controlName)?.hasError(errorName) ?? false;
  }
}
