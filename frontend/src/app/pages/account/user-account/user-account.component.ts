import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EligibilityQuestionnaireDTO, User, UserAccountService } from './user-account.service';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Achievement, DashboardService, UserStats } from '../../dashboard/dashboard.service';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { AuthService } from '../../../core/services/auth/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterModule],
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss'],
})
export class UserAccountComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  userStats: UserStats = {} as any;
  private userId: string = '';
  editProfileMode = false;
  changePasswordMode = false;
  showAchievements = false;
  showQuestionnaires = false;
  loadingStatsAndAchievements: boolean = false;


  genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino', label: 'Feminino' },
    { value: 'Outro', label: 'Outro' },
  ];

  userAchievements: Achievement[] = [];
  hasAchievements = false;
  achievementsCount = 0;

  lastQuestionnaire: any = null;

  constructor(
    private userService: UserAccountService,
    private fb: FormBuilder,
    private authService: AuthService,
    private dashboardService: DashboardService  
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    this.loadUser();
    this.initForms();
    this.getUserStats();
  }


  private loadUser(): void {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (userData) => {
        this.user = userData;
        this.patchProfileForm();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load user data';
        this.isLoading = false;
      }
    });
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      address: [''],
      phone: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      gender: ['', Validators.required],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }

  private patchProfileForm(): void {
    if (!this.user) return;

    this.profileForm.patchValue({
      name: this.user.name,
      email: this.user.email,
      address: this.user.address?.street ||'',
      phone: this.user.phone,
      cpf: this.user.cpf,
      gender: this.user.gender,
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  onEditProfile(): void {
    this.editProfileMode = true;
    this.changePasswordMode = false;
    this.showAchievements = false;
    this.showQuestionnaires = false;
  }

  onChangePassword(): void {
    this.changePasswordMode = true;
    this.editProfileMode = false;
    this.showAchievements = false;
    this.showQuestionnaires = false;

    this.passwordForm.reset();
    this.passwordForm.get('currentPassword')?.setValidators(Validators.required);
    this.passwordForm.get('newPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.passwordForm.get('confirmPassword')?.setValidators(Validators.required);
    this.passwordForm.updateValueAndValidity();

  }

  showAchievementsView(): void {
    this.showAchievements = true;
    this.editProfileMode = false;
    this.changePasswordMode = false;
    this.showQuestionnaires = false;

    // Load achievements logic here
  }

  showQuestionnairesView(): void {
    this.showQuestionnaires = true;
    this.showAchievements = false;
    this.editProfileMode = false;
    this.changePasswordMode = false;

    this.loadLastQuestionnaire();
  }

  hideViews(): void {
    this.editProfileMode = false;
    this.changePasswordMode = false;
    this.showAchievements = false;
    this.showQuestionnaires = false;
    this.successMessage = null;
    this.error = null;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    const updatedData = {
      ...this.user,
      ...this.profileForm.getRawValue(),
      address: { street: this.profileForm.value.address }
    };

    this.userService.updateUser(updatedData).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.successMessage = 'Profile updated successfully';
        this.isLoading = false;
        this.editProfileMode = false;
      },
      error: () => {
        this.error = 'Failed to update profile';
        this.isLoading = false;
      }
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully';
        this.isLoading = false;
        this.changePasswordMode = false;
        this.passwordForm.reset();
      },
      error: () => {
        this.error = 'Failed to change password';
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.editProfileMode = false;
    this.error = null;
    this.successMessage = null;
    this.patchProfileForm();
  }

  cancelPassword(): void {
    this.changePasswordMode = false;
    this.error = null;
    this.successMessage = null;
    this.passwordForm.reset();
  }

  onPhotoSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = () => {
      if (this.user) {
        this.user.photoUrl = reader.result as string;
      }
    };

    reader.readAsDataURL(file); // Lê a imagem como Base64
  }
}



  calculateDaysSinceLastDonation(): number | null {
    return null;
  }

  calculateDaysUntilNextDonation(): number | null {
    return null;
  }

  canDonateNow(): boolean {
    return false;
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(form: FormGroup, field: string): string | null {
      const control = form.get(field);
      if (!control || !control.touched || !control.errors) return null;

      if (control.errors['required']) return 'Campo obrigatório';
      if (control.errors['minlength']) return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
      if (control.errors['email']) return 'Email inválido';
      if (control.errors['pattern']) {
      if (field === 'cpf') return 'CPF deve conter exatamente 11 números';
      if (field === 'phone') return 'Celular deve conter ao menos 11 números';
    }

  return 'Campo inválido';
  }

   public getUserStats(): void {
    this.dashboardService.getUserStats(this.userId).subscribe((stats: UserStats) => {
      stats.achievements = this.sortAchievementsByRarity(stats.achievements);
      this.userStats = stats;
      this.loadingStatsAndAchievements = false;
    });
  }

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

  private loadLastQuestionnaire(): void {
    this.isLoading = true;
    this.userService.getQuestionnairesByUser().subscribe({
      next: (questionnaire) => {
        console.log('Questionários recebidos:', questionnaire);
        this.lastQuestionnaire = questionnaire[0] || null;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar o questionário';
        this.isLoading = false;
      }
    });
  }

isEligibilityField(fieldName: string): boolean {
  const eligibilityFields = ['age', 'weight', 'donationBefore60'];
  return eligibilityFields.includes(fieldName);
}

getAnswerClass(answer: string, isInverted: boolean = false, fieldName: string = ''): string {
  if (!answer) return 'neutral';
  
  const normalizedAnswer = answer.toLowerCase().trim();
  
  if (this.isEligibilityField(fieldName)) {
    switch (normalizedAnswer) {
      case 'sim':
      case 'apto':
        return 'positive';
      case 'não':
      case 'não apto':
        return 'negative';
      default:
        return 'neutral';
    }
  }
  
  if (isInverted) {
    switch (normalizedAnswer) {
      case 'sim':
        return 'negative';
      case 'não':
        return 'positive';
      default:
        return 'neutral';
    }
  } else {
    switch (normalizedAnswer) {
      case 'sim':
        return 'positive';
      case 'não':
        return 'negative';
      default:
        return 'neutral';
    }
  }
}

getAnswerIcon(answer: string, isInverted: boolean = false, fieldName: string = ''): string {
  if (!answer) return 'fa-question';
  
  const normalizedAnswer = answer.toLowerCase().trim();
  
  // Para campos de aptidão (idade, peso, etc.)
  if (this.isEligibilityField(fieldName)) {
    switch (normalizedAnswer) {
      case 'sim':
      case 'apto':
        return 'fa-check';
      case 'não':
      case 'não apto':
        return 'fa-times';
      default:
        return 'fa-question';
    }
  }
  
  if (isInverted) {
    switch (normalizedAnswer) {
      case 'sim':
        return 'fa-times';
      case 'não':
        return 'fa-check';
      default:
        return 'fa-question';
    }
  } else {
    switch (normalizedAnswer) {
      case 'sim':
        return 'fa-check';
      case 'não':
        return 'fa-times';
      default:
        return 'fa-question';
    }
  }
}

getFormattedAnswer(answer: string, fieldName: string = ''): string {
  if (!answer) return 'N/A';
  
  const normalizedAnswer = answer.toLowerCase().trim();
  
  if (this.isEligibilityField(fieldName)) {
    switch (normalizedAnswer) {
      case 'sim':
        return 'Apto';
      case 'não':
        return 'Não Apto';
      default:
        return answer;
    }
  }
  
  return answer;
}

getFormattedResultMessage(questionnaire: EligibilityQuestionnaireDTO): string {
  if (questionnaire.isEligible) {
    return 'Baseado nas suas respostas, você está apto para realizar a doação de sangue. Procure um banco de sangue mais próximo.';
  } else {
    return questionnaire.resultMessage || 'Algumas das suas respostas indicam que você não está apto para doação no momento. Consulte um profissional de saúde para mais informações.';
  }
}

getRecommendations(questionnaire: EligibilityQuestionnaireDTO): string[] {
  const recommendations: string[] = [];
  
  if (!questionnaire.isEligible) {
    if (questionnaire.symptoms === 'Sim') {
      recommendations.push('Aguarde até estar completamente recuperado dos sintomas');
    }
    
    if (questionnaire.medications === 'Sim') {
      recommendations.push('Consulte sobre a compatibilidade dos seus medicamentos com a doação');
    }
    
    if (questionnaire.procedures === 'Sim') {
      recommendations.push('Aguarde o período de recuperação recomendado após procedimentos médicos');
    }
    
    if (questionnaire.tattooOrPiercing === 'Sim') {
      recommendations.push('Aguarde 12 meses após tatuagem, piercing ou acupuntura');
    }
    
    if (questionnaire.covidVaccine === 'Sim') {
      recommendations.push('Aguarde 48 horas após a vacinação contra COVID-19');
    }
    
    if (questionnaire.yellowFeverVaccine === 'Sim') {
      recommendations.push('Aguarde 30 dias após a vacinação contra febre amarela');
    }
    
    if (questionnaire.drugs === 'Sim') {
      recommendations.push('Procure orientação médica especializada sobre uso de substâncias');
    }
    
    if (questionnaire.gender === 'Feminino') {
      if (questionnaire.pregnant === 'Sim') {
        recommendations.push('Gestantes não podem doar sangue por questões de segurança');
      }
      if (questionnaire.recentChildbirth === 'Sim') {
        recommendations.push('Aguarde 12 meses após parto ou aborto');
      }
      if (questionnaire.lastDonationFemale === 'Sim') {
        recommendations.push('Mulheres devem aguardar 90 dias entre doações');
      }
    }
    
    if (questionnaire.gender === 'Masculino' && questionnaire.lastDonationMale === 'Sim') {
      recommendations.push('Homens devem aguardar 60 dias entre doações');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Consulte um profissional de saúde para orientações específicas');
      recommendations.push('Refaça o questionário quando as condições mudarem');
    }
  }
  
  return recommendations;
}

shouldShowField(field: string, gender: string): boolean {
  const femaleOnlyFields = ['pregnant', 'recentChildbirth', 'lastDonationFemale'];
  const maleOnlyFields = ['lastDonationMale'];
  
  if (femaleOnlyFields.includes(field)) {
    return gender === 'Feminino';
  }
  
  if (maleOnlyFields.includes(field)) {
    return gender === 'Masculino';
  }
  
  return true;
}

getTimeSinceQuestionnaire(createdAt: string): string {
  const now = new Date();
  const questionnaireDate = new Date(createdAt);
  const diffInMs = now.getTime() - questionnaireDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Hoje';
  } else if (diffInDays === 1) {
    return 'Ontem';
  } else if (diffInDays < 7) {
    return `${diffInDays} dias atrás`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} semana${weeks > 1 ? 's' : ''} atrás`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} mês${months > 1 ? 'es' : ''} atrás`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} ano${years > 1 ? 's' : ''} atrás`;
  }
}

getEligibilitySummary(questionnaire: EligibilityQuestionnaireDTO): { 
  status: string; 
  color: string; 
  icon: string; 
  message: string 
} {
  if (questionnaire.isEligible) {
    return {
      status: 'Apto',
      color: '#4caf50',
      icon: 'fa-check-circle',
      message: 'Você pode doar sangue!'
    };
  } else {
    return {
      status: 'Não Apto',
      color: '#f44336',
      icon: 'fa-exclamation-triangle',
      message: 'Não é possível doar no momento'
    };
  }
}

getFormattedQuestion(field: string): string {
  const questionMap: { [key: string]: string } = {
    'healthy': 'Está se sentindo bem de saúde?',
    'symptoms': 'Apresenta sintomas como febre, gripe, resfriado?',
    'diseases': 'Possui doenças cardíacas, diabetes, ou outras condições crônicas?',
    'medications': 'Está tomando medicamentos?',
    'pregnant': 'Está grávida?',
    'recentChildbirth': 'Teve parto ou aborto nos últimos 12 meses?',
    'procedures': 'Realizou cirurgias ou procedimentos médicos recentes?',
    'drugs': 'Fez uso de drogas injetáveis?',
    'parter': 'Teve múltiplos parceiros sexuais ou relações de risco?',
    'tatooOrPiercing': 'Fez tatuagem, piercing ou acupuntura nos últimos 12 meses?',
    'lastDonationMale': 'Última doação foi há menos de 60 dias?',
    'lastDonationFemale': 'Última doação foi há menos de 90 dias?',
    'covidVaccine': 'Tomou vacina COVID-19 nas últimas 48h?',
    'yellowFeverVaccine': 'Tomou vacina da febre amarela nos últimos 30 dias?',
    'travelRiskArea': 'Viajou para áreas de risco (malária, febre amarela) recentemente?',
    'donationBefore60': 'Já doou sangue antes dos 60 anos?'
  };
  
  return questionMap[field] || field;
}

/**
 * Navega para fazer um novo questionário
 */
onNewQuestionnaire(): void {
  // Implementar navegação para página de questionário
  // this.router.navigate(['/questionnaire']);
  console.log('Navegando para novo questionário...');
}

/**
 * Navega para encontrar bancos de sangue
 */
onFindBloodBank(): void {
  // Implementar navegação para página de bancos de sangue
  // this.router.navigate(['/blood-banks']);
  console.log('Navegando para bancos de sangue...');
}

}
