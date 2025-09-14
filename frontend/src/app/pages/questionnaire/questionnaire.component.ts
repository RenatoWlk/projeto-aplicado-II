import { Component } from '@angular/core';
import { QuestionnaireService, QuestionnaireData } from './questionnaire.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class QuestionnaireComponent {
  form: FormGroup;
  resultado: string = '';
  perguntasInvalidas: string[] = [];
  submitted = false;
  sucessoPreenchimento = false;

  perguntasLabels: { [key: string]: string } = {
    idade: 'Idade entre 16 e 69 anos',
    sexo: 'Sexo',
    doacaoAntesDos60: 'Já doou sangue antes dos 60 anos',
    peso: 'Pesa mais de 50kg',
    saudavel: 'Está saudável hoje',
    gravida: 'Está grávida',
    partoRecente: 'Teve parto nos últimos 12 meses',
    sintomas: 'Está com sintomas infecciosos',
    doencas: 'Teve doenças graves',
    medicamentos: 'Está tomando medicamentos',
    procedimentos: 'Fez procedimentos recentes',
    drogas: 'Usa drogas ilícitas injetáveis',
    parceiros: 'Teve múltiplos parceiros sexuais',
    tatuagem: 'Fez tatuagem nos últimos 12 meses',
    homemUltimaDoacao: 'Homem: doou sangue há menos de 2 meses',
    mulherUltimaDoacao: 'Mulher: doou sangue há menos de 3 meses',
    vacinaCovid: 'Tomou vacina COVID-19 nos últimos 7 dias',
    vacinaFebre: 'Tomou vacina febre amarela nos últimos 30 dias',
    viagemRisco: 'Viajou para área de risco de malária'
  };

constructor(
  private fb: FormBuilder,
  private questionnaireService: QuestionnaireService,
  private authService: AuthService
) {
  this.form = this.fb.group({
  age: [null, [Validators.required]],
  gender: [null, Validators.required],
  donationBefore60: [null, Validators.required],
  weight: [null, [Validators.required]],
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
  travelRiskArea: [null, Validators.required]
});


  this.form.get('gender')?.valueChanges.subscribe(gender => {
    if (gender === 'masculino') {
      this.form.get('lastDonationMale')?.setValidators(Validators.required);
      this.form.get('lastDonationFemale')?.clearValidators();
      this.form.get('pregnant')?.clearValidators();
      this.form.get('recentChildbirth')?.clearValidators();
    } else if (gender === 'feminino') {
      this.form.get('lastDonationFemale')?.setValidators(Validators.required);
      this.form.get('pregnant')?.setValidators(Validators.required);
      this.form.get('recentChildbirth')?.setValidators(Validators.required);
      this.form.get('lastDonationMale')?.clearValidators();
    } else {
      this.form.get('lastDonationMale')?.clearValidators();
      this.form.get('lastDonationFemale')?.clearValidators();
      this.form.get('pregnant')?.clearValidators();
      this.form.get('recentChildbirth')?.clearValidators();
    }

    this.form.get('lastDonationMale')?.updateValueAndValidity();
    this.form.get('lastDonationFemale')?.updateValueAndValidity();
    this.form.get('pregnant')?.updateValueAndValidity();
    this.form.get('recentChildbirth')?.updateValueAndValidity();
  });

}


  onSubmit() {
    this.submitted = true;
    this.sucessoPreenchimento = false;
    this.perguntasInvalidas = [];
    this.resultado = '';

    const simInvalida = [
      'pregnant', 'recentChildbirth', 'symptoms', 'diseases',
      'medications', 'procedures', 'drugs', 'partners', 'tattooOrPiercing',
      'covidVaccine', 'yellowFeverVaccine', 'travelRiskArea',
      'lastDonationMale', 'lastDonationFemale'
    ];

    const naoInvalida = [
      'age', 'donationBefore60', 'weight', 'healthy'
    ];

    const gender = this.form.get('gender')?.value;
    let camposRelevantes = [
      'age', 'gender', 'donationBefore60', 'weight', 'healthy',
      'symptoms', 'diseases', 'medications', 'procedures', 'drugs',
      'partners', 'tattooOrPiercing', 'covidVaccine',
      'yellowFeverVaccine', 'travelRiskArea'
    ];

    if (gender === 'masculino') {
      camposRelevantes.push('lastDonationMale');
    }
    if (gender === 'feminino') {
      camposRelevantes.push('pregnant', 'recentChildbirth', 'lastDonationFemale');
    }


    const naoRespondidas = camposRelevantes.filter(
      key => this.form.get(key)?.value === '' || this.form.get(key)?.value === null
    );

    if (naoRespondidas.length > 0) {
      this.resultado = 'Por favor, responda todas as perguntas antes de enviar o formulário.';
      this.perguntasInvalidas = naoRespondidas;
      return;
    }

    this.sucessoPreenchimento = true;

    for (const controlName of camposRelevantes) {
      const control = this.form.get(controlName);
      if (
        (simInvalida.includes(controlName) && control?.value === 'Sim') ||
        (naoInvalida.includes(controlName) && control?.value === 'Não')
      ) {
        this.perguntasInvalidas.push(controlName);
      }
    }

    const isEligible = this.perguntasInvalidas.length === 0;
    this.resultado = isEligible
      ? 'Parabéns! Você está apto(a) para doar sangue. Procure o hemocentro mais próximo.'
      : 'Você não está elegível para doar sangue neste momento. Veja abaixo os critérios não atendidos:';

    if (this.sucessoPreenchimento) {
      const data: QuestionnaireData = this.form.value;
      console.log('Dados do questionário:', data);
      console.log('É elegible: ',isEligible);
      this.questionnaireService.submitQuestionnaire(data).subscribe({
        next: () => console.log('Respostas enviadas com sucesso.'),
        error: (err) => console.error('Erro ao enviar respostas:', err)
      });
    }
  }

  responderNovamente() {
    this.form.reset();
    this.submitted = false;
    this.sucessoPreenchimento = false;
    this.perguntasInvalidas = [];
    this.resultado = '';
  }
}
