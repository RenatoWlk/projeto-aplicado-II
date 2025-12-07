import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { RegisterService } from '../../pages/register/register.service';
import { NotificationBannerService } from '../../shared/notification-banner/notification-banner.service';
import { AppRoutesPaths } from '../../shared/app.constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatStepperModule, MatRadioModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, RouterModule,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class RegisterComponent implements OnInit, OnDestroy{
  readonly appRoutesPaths = AppRoutesPaths;
  userForm!: FormGroup;
  // Subject to manage unsubscribe
  private destroy$ = new Subject<void>();

  @ViewChild(MatStepper) stepper!: MatStepper;

  constructor(private fb: FormBuilder, private registerService: RegisterService, private notificationService: NotificationBannerService) {}

  selectedOption: string = '';

  // Método para selecionar o tipo de usuário e avançar
  selectUserType(type: string): void {
    this.selectedOption = type;
    // Aguardar um ciclo de detecção de mudanças antes de avançar
    setTimeout(() => {
      this.stepper.next();
    }, 0);
  }

  // Validator customizado para verificar se as senhas coincidem
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmedPassword = group.get('confirmed_password')?.value;
    
    if (password && confirmedPassword && password !== confirmedPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      userType: ['', Validators.required],

      credentials: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmed_password: ['', [Validators.required, Validators.minLength(6)]],
      }, { validators: this.passwordMatchValidator }),

      /** USER */
      personalInfo: this.fb.group({
        name: ['', Validators.required],
        cpf: ['', [Validators.required, Validators.pattern(/^[\d\.\-]{11,14}$/)]],
        gender: ['', Validators.required],
        bloodtype: ['', Validators.required],
        telephone: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        street: ['', Validators.required],
        zipcode: ['', Validators.required],
      }),

      /** BLOOD BANK */
      bloodbankInfo: this.fb.group({ 
        instituitonName: ['', Validators.required],
        cnpj: ['', [Validators.required, Validators.pattern(/^[\d\.\-\/]{14,18}$/)]],
        city: ['', Validators.required],
        state: ['', Validators.required],
        street: ['', Validators.required],
        zipcode: ['', Validators.required],
        telephone: ['', Validators.required],
      }),

      /** PARTNER */
      partnerInfo: this.fb.group({ 
        partnerName: ['', Validators.required],
        cnpj: ['', [Validators.required, Validators.pattern(/^[\d\.\-\/]{14,18}$/)]],
        city: ['', Validators.required],
        state: ['', Validators.required],
        street: ['', Validators.required],
        zipcode: ['', Validators.required],
        telephone: ['', Validators.required],
      }),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  get credentialsGroup() {
    return this.userForm.get('credentials') as FormGroup;
  }

  /** USER */
  get personalInfoGroup() {
    return this.userForm.get('personalInfo') as FormGroup;
  }

  /** BLOOD BANK */
  get bloodbankInfoFormGroup() {
    return this.userForm.get('bloodbankInfo') as FormGroup;
  }
  
  /** PARTNER */
  get partnerInfoFormGroup() {
    return this.userForm.get('partnerInfo') as FormGroup;
  }

  formatPhone(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 11) value = value.substring(0, 11);

    // Máscara (XX) X XXXX-XXXX
    if (value.length > 10) {
      value = value.replace(/^(\d\d)(\d)(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');
    }

    input.value = value;
    
    // Atualizar o FormControl apropriado baseado no tipo de usuário
    if (this.selectedOption === 'donator') {
      this.personalInfoGroup.get('telephone')?.setValue(value, { emitEvent: false });
    } else if (this.selectedOption === 'bloodbank') {
      this.bloodbankInfoFormGroup.get('telephone')?.setValue(value, { emitEvent: false });
    } else if (this.selectedOption === 'partner') {
      this.partnerInfoFormGroup.get('telephone')?.setValue(value, { emitEvent: false });
    }
  }

  formatCPF(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, ''); 
    
    if (value.length > 11) value = value.substring(0, 11);

    // Máscara 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    input.value = value;
    this.personalInfoGroup.get('cpf')?.setValue(value, { emitEvent: false });
  }

  formatCEP(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 8) value = value.substring(0, 8);

    // Máscara 00000-000
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
    }

    input.value = value;
    
    // Atualizar o FormControl apropriado baseado no tipo de usuário
    if (this.selectedOption === 'donator') {
      this.personalInfoGroup.get('zipcode')?.setValue(value, { emitEvent: false });
    } else if (this.selectedOption === 'bloodbank') {
      this.bloodbankInfoFormGroup.get('zipcode')?.setValue(value, { emitEvent: false });
    } else if (this.selectedOption === 'partner') {
      this.partnerInfoFormGroup.get('zipcode')?.setValue(value, { emitEvent: false });
    }
  }

  formatCNPJ(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 14) value = value.substring(0, 14);

    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2}).*/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
    }

    input.value = value;

    // Atualizar o FormControl apropriado baseado no tipo de usuário
    if (this.selectedOption === 'bloodbank') {
      this.bloodbankInfoFormGroup.get('cnpj')?.setValue(value, { emitEvent: false });
    } else if (this.selectedOption === 'partner') {
      this.partnerInfoFormGroup.get('cnpj')?.setValue(value, { emitEvent: false });
    }
  }

  private clean(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/\D/g, '');
  }
  
  submit() {
    const email = this.credentialsGroup.get('email')?.value;
    const password = this.credentialsGroup.get('password')?.value;

    /**
     * USER
     */
    if (this.selectedOption === 'donator') {
      const payload = {
        name: this.personalInfoGroup.get('name')?.value,
        email: email,
        password: password,
        cpf: this.clean(this.personalInfoGroup.get('cpf')?.value),
        gender: this.personalInfoGroup.get('gender')?.value,
        bloodType: this.personalInfoGroup.get('bloodtype')?.value,
        phone: this.clean(this.personalInfoGroup.get('telephone')?.value),
        address: {
          city: this.personalInfoGroup.get('city')?.value,
          state: this.personalInfoGroup.get('state')?.value,
          street: this.personalInfoGroup.get('street')?.value,
          zipCode: this.clean(this.personalInfoGroup.get('zipcode')?.value),
        },
      };

      this.registerService.registerDonator(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.notificationService.show('Cadastro realizado com sucesso', "success", 3000);
        },
        error: (err) => {
          this.notificationService.show('Erro ao cadastrador doador', "error", 3000);
        }
      });

    /**
     * BLOOD BANK
     */
    } else if (this.selectedOption === 'bloodbank') {
      const payload = {
        name: this.bloodbankInfoFormGroup.get('instituitonName')?.value,
        email: email,
        password: password,
        cnpj: this.clean(this.bloodbankInfoFormGroup.get('cnpj')?.value),
        address: {
          city: this.bloodbankInfoFormGroup.get('city')?.value,
          state: this.bloodbankInfoFormGroup.get('state')?.value,
          street: this.bloodbankInfoFormGroup.get('street')?.value,
          zipCode: this.clean(this.bloodbankInfoFormGroup.get('zipcode')?.value),
        },
        campaigns: [],
        phone: this.clean(this.bloodbankInfoFormGroup.get('telephone')?.value),
      };

      this.registerService.registerBloodBank(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.notificationService.show('Cadastro realizado com sucesso', "success", 3000);
        },
        error: (err) => {
          this.notificationService.show('Erro ao cadastrador banco de sangue', "error", 3000);
        }
      });

    /**
     * PARTNER
     */
    } else if (this.selectedOption === 'partner') {
      const payload = {
        name: this.partnerInfoFormGroup.get('partnerName')?.value,
        email: email,
        password: password,
        cnpj: this.clean(this.partnerInfoFormGroup.get('cnpj')?.value),
        address: {
          city: this.partnerInfoFormGroup.get('city')?.value,
          state: this.partnerInfoFormGroup.get('state')?.value,
          street: this.partnerInfoFormGroup.get('street')?.value,
          zipCode: this.clean(this.partnerInfoFormGroup.get('zipcode')?.value)
        },
        offers: [],
        phone: this.clean(this.partnerInfoFormGroup.get('telephone')?.value),
      };

      this.registerService.registerPartner(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.notificationService.show('Cadastro realizado com sucesso', "success", 3000);
        },
        error: (err) => {
          this.notificationService.show('Erro ao cadastrador parceiro', "error", 3000);
        }
      });
    }
  }
}