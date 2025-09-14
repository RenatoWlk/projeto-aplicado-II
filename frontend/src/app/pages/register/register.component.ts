import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { RegisterService } from '../../pages/register/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatStepperModule, MatRadioModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, RouterModule,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class RegisterComponent {
  userForm!: FormGroup;

  constructor(private fb: FormBuilder, private registerService: RegisterService) {}

  selectedOption: string = '';

  ngOnInit(): void {
    this.userForm = this.fb.group({
      userType: ['', Validators.required],

      credentials: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmed_password: ['', [Validators.required, Validators.minLength(6)]],
      }),

      /** USER */
      personalInfo: this.fb.group({
        name: ['', Validators.required],
        cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
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
        cnpj: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        street: ['', Validators.required],
        zipcode: ['', Validators.required],
        telephone: ['', Validators.required],
      }),

      /** PARTNER */
      partnerInfo: this.fb.group({ 
        partnerName: ['', Validators.required],
        cnpj: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        street: ['', Validators.required],
        zipcode: ['', Validators.required],
        telephone: ['', Validators.required],
      }),
    });
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
        cpf: this.personalInfoGroup.get('cpf')?.value,
        gender: this.personalInfoGroup.get('gender')?.value,
        bloodType: this.personalInfoGroup.get('bloodtype')?.value,
        phone: this.personalInfoGroup.get('telephone')?.value,
        address: {
          city: this.personalInfoGroup.get('city')?.value,
          state: this.personalInfoGroup.get('state')?.value,
          street: this.personalInfoGroup.get('street')?.value,
          zipCode: this.personalInfoGroup.get('zipcode')?.value,
        },
      };

      this.registerService.registerDonator(payload).subscribe({
        next: (res) => {
          console.log('Doador cadastrado com sucesso!', res);
          alert('Cadastro realizado com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao cadastrar doador', err);
          alert('Erro ao cadastrar doador.');
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
        cnpj: this.bloodbankInfoFormGroup.get('cnpj')?.value,
        address: {
          city: this.bloodbankInfoFormGroup.get('city')?.value,
          state: this.bloodbankInfoFormGroup.get('state')?.value,
          street: this.bloodbankInfoFormGroup.get('street')?.value,
          zipCode: this.bloodbankInfoFormGroup.get('zipcode')?.value,
        },
        campaigns: [],
        phone: this.bloodbankInfoFormGroup.get('telephone')?.value,
      };

      this.registerService.registerBloodBank(payload).subscribe({
        next: (res) => {
          console.log('Banco de sangue cadastrado com sucesso!', res);
          alert('Cadastro realizado com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao cadastrar banco de sangue', err);
          alert('Erro ao cadastrar banco de sangue.');
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
        cnpj: this.partnerInfoFormGroup.get('cnpj')?.value,
        address: {
          city: this.partnerInfoFormGroup.get('city')?.value,
          state: this.partnerInfoFormGroup.get('state')?.value,
          street: this.partnerInfoFormGroup.get('street')?.value,
          zipCode: this.partnerInfoFormGroup.get('zipcode')?.value
        },
        offers: [],
        phone: this.partnerInfoFormGroup.get('telephone')?.value,
      };

      this.registerService.registerPartner(payload).subscribe({
        next: (res) => {
          console.log('Parceiro cadastrado com sucesso!', res);
          alert('Cadastro realizado com sucesso!');
        },
        error: (err) => {
          console.error('Erro ao cadastrar parceiro', err);
          alert('Erro ao cadastrar parceiro.');
        }
      });
    }
  }
}

