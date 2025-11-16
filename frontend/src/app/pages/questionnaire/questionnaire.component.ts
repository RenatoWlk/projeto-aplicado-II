import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuestionnaireService, QuestionnaireData } from './questionnaire.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { NotificationBannerService } from '../../shared/notification-banner/notification-banner.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class QuestionnaireComponent {
  form: FormGroup;
  invalidQuestions: string[] = [];
  submitted = false;
  success = false;

  questionLabels: Record<string, string> = {
    age: 'Idade entre 16 e 69 anos',
    gender: 'Sexo',
    donationBefore60: 'Já doou sangue antes dos 60 anos',
    weight: 'Pesa mais de 50kg',
    healthy: 'Está saudável hoje',
    pregnant: 'Está grávida',
    recentChildbirth: 'Teve parto nos últimos 12 meses',
    symptoms: 'Está com sintomas infecciosos',
    diseases: 'Teve doenças graves',
    medications: 'Está tomando medicamentos',
    procedures: 'Fez procedimentos recentes',
    drugs: 'Usa drogas ilícitas injetáveis',
    partners: 'Teve múltiplos parceiros sexuais',
    tattooOrPiercing: 'Fez tatuagem nos últimos 12 meses',
    lastDonationMale: 'Homem: doou sangue há menos de 2 meses',
    lastDonationFemale: 'Mulher: doou sangue há menos de 3 meses',
    covidVaccine: 'Tomou vacina COVID-19 nos últimos 7 dias',
    yellowFeverVaccine: 'Tomou vacina febre amarela nos últimos 30 dias',
    travelRiskArea: 'Viajou para área de risco de malária',
  };

  private readonly invalidIfYes = [
    'pregnant', 'recentChildbirth', 'symptoms', 'diseases',
    'medications', 'procedures', 'drugs', 'partners', 'tattooOrPiercing',
    'covidVaccine', 'yellowFeverVaccine', 'travelRiskArea',
    'lastDonationMale', 'lastDonationFemale',
  ];

  private readonly invalidIfNo = [
    'age', 'donationBefore60', 'weight', 'healthy',
  ];

  constructor(
    private fb: FormBuilder,
    private questionnaireService: QuestionnaireService,
    private authService: AuthService,
    private notificationService: NotificationBannerService,
  ) {
    this.form = this.buildForm();
    this.handleGenderValidation();
  }

  private buildForm(): FormGroup {
    return this.fb.group({
      age: [null, Validators.required],
      gender: [null, Validators.required],
      donationBefore60: [null, Validators.required],
      weight: [null, Validators.required],
      healthy: [null, Validators.required],
      pregnant: [null],
      recentChildbirth: [null],
      symptoms: [null, Validators.required],
      diseases: [null, Validators.required],
      medications: [null, Validators.required],
      procedures: [null, Validators.required],
      drugs: [null, Validators.required],
      partners: [null, Validators.required],
      tattooOrPiercing: [null, Validators.required],
      lastDonationMale: [null],
      lastDonationFemale: [null],
      covidVaccine: [null, Validators.required],
      yellowFeverVaccine: [null, Validators.required],
      travelRiskArea: [null, Validators.required],
    });
  }

  private handleGenderValidation(): void {
    this.form.get('gender')?.valueChanges.subscribe((gender) => {
      const maleFields = ['lastDonationMale'];
      const femaleFields = ['lastDonationFemale', 'pregnant', 'recentChildbirth'];

      maleFields.forEach((f) => this.form.get(f)?.clearValidators());
      femaleFields.forEach((f) => this.form.get(f)?.clearValidators());

      if (gender === 'masculino') {
        this.form.get('lastDonationMale')?.setValidators(Validators.required);
      } else if (gender === 'feminino') {
        femaleFields.forEach((f) => this.form.get(f)?.setValidators(Validators.required));
      }

      [...maleFields, ...femaleFields].forEach((f) => this.form.get(f)?.updateValueAndValidity());
    });
  }

  private getRelevantFields(): string[] {
    const gender = this.form.get('gender')?.value;
    const baseFields = [
      'age', 'gender', 'donationBefore60', 'weight', 'healthy',
      'symptoms', 'diseases', 'medications', 'procedures',
      'drugs', 'partners', 'tattooOrPiercing',
      'covidVaccine', 'yellowFeverVaccine', 'travelRiskArea',
    ];

    if (gender === 'masculino') return [...baseFields, 'lastDonationMale'];
    if (gender === 'feminino') return [...baseFields, 'pregnant', 'recentChildbirth', 'lastDonationFemale'];

    return baseFields;
  }

  private validateEligibility(relevantFields: string[]): boolean {
    this.invalidQuestions = [];

    relevantFields.forEach((field) => {
      const value = this.form.get(field)?.value;
      if (
        (this.invalidIfYes.includes(field) && value === true) ||
        (this.invalidIfNo.includes(field) && value === false)
      ) {
        this.invalidQuestions.push(field);
      }
    });

    return this.invalidQuestions.length === 0;
  }

  onSubmit(): void {
    this.submitted = true;
    this.success = false;
    this.invalidQuestions = [];

    const relevantFields = this.getRelevantFields();
    const unanswered = relevantFields.filter(
      (field) => this.form.get(field)?.value === null || this.form.get(field)?.value === undefined
    );

    if (unanswered.length > 0) {
      this.invalidQuestions = unanswered;
      return;
    }

    const isEligible = this.validateEligibility(relevantFields);

    this.success = true;

    const data: QuestionnaireData = {
      ...this.form.value,
      eligible: isEligible,
      userId: this.authService.getCurrentUserId(),
    };

    this.questionnaireService.submitQuestionnaire(data)
    .subscribe({
        next: response => this.notificationService.show('Questionário respondido com sucesso!', 'success', 3000),
        error: err => this.notificationService.show('Erro ao enviar questionário!', 'error', 3000),
    });

  }

  resetForm(): void {
    this.form.reset();
    this.submitted = false;
    this.success = false;
    this.invalidQuestions = [];
  }
}
