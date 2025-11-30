import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EligibilityQuestionnaireDTO, User, UserAccountService } from './user-account.service';
import { DonationService, DonationStatus, DonationResponse } from '../../calendar/donator-calendar/donator-calendar.service';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Achievement, DashboardService, UserStats } from '../../dashboard/dashboard.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Router } from '@angular/router';
import { QuestionnairePdfService } from './questionnaire-pdf.service';
import { AppRoutesPaths } from '../../../shared/app.constants';
import { DonationInfoService } from '../../donation-info/donation-info.service';
import { RouterModule } from '@angular/router';


interface DonationHistory {
  userName?: string;
  date: string;
  hour: string;
  status: DonationStatus;
  bloodBankName?: string;
}


@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss'],
})
export class UserAccountComponent implements OnInit {
  readonly appRoutesPaths = AppRoutesPaths;
  user: User | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  eligibleQuestionnaire: EligibilityQuestionnaireDTO | null = null;

  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  donationHistory: DonationHistory[] = [];
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
    private donationService: DonationService,
    private fb: FormBuilder,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private pdfService: QuestionnairePdfService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUserId();
    this.loadUser();
    this.initForms();
    this.loadDonationHistory();
    this.getUserStats();
    this.loadDonationHistory();
  }


  private loadUser(): void {
    this.isLoading = true;
    this.userService.getUser().subscribe({
      next: (userData) => {
        this.user = userData;
        this.patchProfileForm();
        this.isLoading = false;

        this.calculateDonationStatus();
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
      phone: ['', [Validators.required, Validators.pattern(/^[\d\(\)\-\s]{11,16}$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^[\d\.\-]{11,14}$/)]],
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

  activeAppointment: any | null = null; 

  private loadDonationHistory(): void {
    const userId = this.authService.getCurrentUserId();
    this.isLoading = true;

    this.donationService.getUserDonations(userId).subscribe({
      next: (donations: any[]) => { // Tipando como array
        this.isLoading = false;

        const sortedDonations = donations.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        this.donationHistory = sortedDonations.map((donation) => ({
          userName: donation.userName,
          date: this.formatDate(donation.date), // Mantendo sua formatação
          hour: donation.hour,
          status: donation.status,
          bloodBankName: donation.bloodBankName
        }));

        const futureAppointment = sortedDonations.find(d => 
          d.status === DonationStatus.PENDING || 
          d.status === DonationStatus.CONFIRMED
        );
        
        this.activeAppointment = futureAppointment || null;

        const lastCompleted = sortedDonations.find(d => d.status === DonationStatus.COMPLETED);

        if (this.user) {
          if (lastCompleted) {
            this.user.lastDonation = lastCompleted.date;
            this.calculateNextEligibleDate(lastCompleted.date);
          } else {
            this.user.lastDonation = ''; 
            this.user.nextEligibleDonation = new Date().toISOString(); // Pode hoje
          }
        }
      },
      error: () => {
        this.error = 'Failed to load donation history';
        this.isLoading = false;
      }
    });
  }

   /**
   * Formata a data para exibição
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Retorna classe CSS baseada no status
   */
  getStatusClass(status: DonationStatus): string {
    switch(status) {
      case DonationStatus.PENDING: return 'status-pending';
      case DonationStatus.CONFIRMED: return 'status-confirmed';
      case DonationStatus.COMPLETED: return 'status-completed';
      case DonationStatus.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  }

  /**
   * Retorna texto legível do status
   */
  getStatusLabel(status: DonationStatus): string {
    switch(status) {
      case DonationStatus.PENDING: return 'Pendente';
      case DonationStatus.CONFIRMED: return 'Confirmado';
      case DonationStatus.COMPLETED: return 'Completado';
      case DonationStatus.CANCELLED: return 'Cancelado';
      case DonationStatus.NO_SHOW: return 'Não Compareceu';
      default: return status;
    }
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

  const rawData = this.profileForm.getRawValue();

  if (rawData.phone) {
      rawData.phone = rawData.phone.replace(/\D/g, ''); 
  }
  if (rawData.cpf) {
      rawData.cpf = rawData.cpf.replace(/\D/g, '');
  }

  const updatedData = {
    ...this.user,
    ...rawData,
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
    // TODO 
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

  private calculateNextEligibleDate(lastDonationDateStr: string): void {
    if (!this.user || !this.user.gender) return;

    const lastDate = new Date(lastDonationDateStr);
    const nextDate = new Date(lastDate);

    // Regra de Negócio: Homens 60 dias, Mulheres 90 dias
    const intervalDays = this.user.gender === 'Masculino' ? 60 : 90;
    
    // Adiciona os dias na data
    nextDate.setDate(lastDate.getDate() + intervalDays);

    // Converte para string ISO (YYYY-MM-DD) para salvar no objeto user
    this.user.nextEligibleDonation = nextDate.toISOString().split('T')[0];
  }

  // --- MÉTODOS QUE ERAM "TODO" E AGORA ESTÃO IMPLEMENTADOS ---

  calculateDaysSinceLastDonation(): number | null {
    if (!this.user?.lastDonation) return null;

    const lastDate = new Date(this.user.lastDonation);
    const today = new Date();

    // Diferença em milissegundos
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    // Converte para dias (1000ms * 60s * 60min * 24h)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    return diffDays;
  }

 calculateDaysUntilNextDonation(): number {
    if (!this.user?.nextEligibleDonation) return 0;

    const nextDate = new Date(this.user.nextEligibleDonation);
    const today = new Date();
    
    // Zera horas para comparar apenas datas
    today.setHours(0, 0, 0, 0);
    nextDate.setHours(0, 0, 0, 0);

    if (today >= nextDate) return 0;

    const diffTime = nextDate.getTime() - today.getTime();
    // Converte ms em dias
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Verifica se está apto pelo tempo
  canDonateNow(): boolean {
    // Se não tem próxima data definida (nunca doou), então pode
    if (!this.user?.nextEligibleDonation) return true;
    
    const daysRemaining = this.calculateDaysUntilNextDonation();
    return daysRemaining <= 0;
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
    this.loadingStatsAndAchievements = true;

    this.dashboardService.getUserStats(this.userId).subscribe({
      next: (stats: UserStats) => {
        if (stats.achievements) {
          stats.achievements = this.sortAchievementsByRarity(stats.achievements);
          
          this.hasAchievements = stats.achievements.length > 0;
          this.achievementsCount = stats.achievements.length;
          this.userAchievements = stats.achievements;
        } else {
          this.hasAchievements = false;
          this.achievementsCount = 0;
        }

        this.userStats = stats;
        this.loadingStatsAndAchievements = false;
      },
      error: (err) => {
        console.error('Erro ao carregar stats', err);
        this.loadingStatsAndAchievements = false;
        this.hasAchievements = false; 
      }
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

  getAnswerClass(field: string, answer: boolean | null | undefined): string {
  if (answer === null || answer === undefined) return 'neutral';

  const expected = this.expectedAnswers[field];

  if (expected === undefined) return 'neutral';

  return answer === expected ? 'yes' : 'no';
}
  getAnswerIcon(answer: boolean | null): string {
  if (answer === null) return 'fa-question';
  return answer ? 'fa-check' : 'fa-xmark';
}

getFormattedAnswer(answer: boolean | null): string {
  if (answer === null) return '-';
  return answer ? 'Sim' : 'Não';
}

formatPhone(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) value = value.substring(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d\d)(\d)(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');
    }

    input.value = value;
    
    this.profileForm.get('phone')?.setValue(value, { emitEvent: false });
  }

  formatCPF(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove letras
    
    if (value.length > 11) value = value.substring(0, 11);

    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    input.value = value;
    this.profileForm.get('cpf')?.setValue(value, { emitEvent: false });
  }

  getFormattedPhone(phone: string | undefined): string {
    if (!phone) return 'Não informado';
    
    const value = phone.replace(/\D/g, '');
    
    if (value.length > 10) {
      return value.replace(/^(\d\d)(\d)(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
    } else if (value.length > 5) {
      return value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else {
      return value;
    }
  }

  getFormattedCPF(cpf: string | undefined): string {
    if (!cpf) return 'Não informado';
    
    const value = cpf.replace(/\D/g, '');
    
    if (value.length <= 11) {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  }

  getFormattedResultMessage(questionnaire: EligibilityQuestionnaireDTO): string {
    if (questionnaire.eligible) {
      return 'Baseado nas suas respostas, você está apto para realizar a doação de sangue. Procure um banco de sangue mais próximo.';
    } else {
      return questionnaire.resultMessage || 'Algumas das suas respostas indicam que você não está apto para doação no momento. Consulte um profissional de saúde para mais informações.';
    }
  }
  

  getRecommendations(questionnaire: EligibilityQuestionnaireDTO): string[] {
    const recommendations: string[] = [];
    
    if (!questionnaire.eligible) {
      if (questionnaire.symptoms === true) {
        recommendations.push('Aguarde até estar completamente recuperado dos sintomas');
      }
      
      if (questionnaire.medications === true) {
        recommendations.push('Consulte sobre a compatibilidade dos seus medicamentos com a doação');
      }
      
      if (questionnaire.procedures === true) {
        recommendations.push('Aguarde o período de recuperação recomendado após procedimentos médicos');
      }
      
      if (questionnaire.tattooOrPiercing === true) {
        recommendations.push('Aguarde 12 meses após tatuagem, piercing ou acupuntura');
      }
      
      if (questionnaire.covidVaccine === true) {
        recommendations.push('Aguarde 48 horas após a vacinação contra COVID-19');
      }
      
      if (questionnaire.yellowFeverVaccine === true) {
        recommendations.push('Aguarde 30 dias após a vacinação contra febre amarela');
      }
      
      if (questionnaire.drugs === true) {
        recommendations.push('Procure orientação médica especializada sobre uso de substâncias');
      }
      
      if (questionnaire.gender === 'Feminino') {
        if (questionnaire.pregnant === true) {
          recommendations.push('Gestantes não podem doar sangue por questões de segurança');
        }
        if (questionnaire.recentChildbirth === true) {
          recommendations.push('Aguarde 12 meses após parto ou aborto');
        }
        if (questionnaire.lastDonationFemale === true) {
          recommendations.push('Mulheres devem aguardar 90 dias entre doações');
        }
      }
      
      if (questionnaire.gender === 'Masculino' && questionnaire.lastDonationMale === true) {
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
    if (questionnaire.eligible) {
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

  onNewQuestionnaire(): void {
    this.router.navigate(['/' + this.appRoutesPaths.QUESTIONNAIRE]);
  }

  onFindBloodBank(): void {
    this.router.navigate(['/' + this.appRoutesPaths.MAP]);
  }

  downloadQuestionnairePDF(): void {
    if (this.lastQuestionnaire && this.user) {
      this.pdfService.generatePDF(this.lastQuestionnaire, this.user.name);
    }
  }

  private readonly expectedAnswers: Record<string, boolean> = {
  // TRUE EXPECTED
  age: true,
  weight: true,
  healthy: true,
  donationBefore60: true,
  // FALSE EXPECTED
  pregnant: false,
  recentChildbirth: false,
  symptoms: false,
  diseases: false,
  medications: false,
  procedures: false,
  drugs: false,
  partners: false,
  tattooOrPiercing: false,
  lastDonationMale: false,
  lastDonationFemale: false,
  covidVaccine: false,
  yellowFeverVaccine: false,
  travelRiskArea: false
};

private calculateDonationStatus(): void {
    if (!this.user || !this.userId) return;

    this.donationService.getUserDonations(this.userId).subscribe({
      next: (donations: DonationResponse[]) => {
        
        const completedDonations = donations.filter(
          donation => donation.status === DonationStatus.COMPLETED
        );

        if (completedDonations.length > 0) {
          if (!this.user) return;
          const lastDonation = completedDonations.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];

          this.user.lastDonation = lastDonation.date;

          const intervalDays = (this.user.gender === 'Masculino') ? 90 : 120;

          const lastDate = new Date(lastDonation.date);
          const nextDate = new Date(lastDate);
          nextDate.setDate(lastDate.getDate() + intervalDays);

          this.user.nextEligibleDonation = nextDate.toISOString();
        } else {
          if (this.user) {
            this.user.lastDonation = ''; 
            this.user.nextEligibleDonation = new Date().toISOString();
          }
        }
      },
      error: (err) => console.error('Erro ao calcular status de doação', err)
    });
  }

}
