import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BloodBank, BloodBankAccountService } from './bloodbank-account.service';
import { CommonModule } from '@angular/common';
// IMPORTANTE: Importe a Campaign do Dashboard para manter a tipagem correta
import { Campaign } from '../../dashboard/dashboard.service'; 
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-bloodbank-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './bloodbank-account.component.html',
  styleUrls: ['./bloodbank-account.component.scss'],
})
export class BloodBankAccountComponent implements OnInit {
  bloodBank: BloodBank | null = null;

  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  editProfileMode = false;
  addCampaignMode = false;
  editCampaignMode = false;

  profileForm!: FormGroup;
  campaignForm!: FormGroup;

  editingCampaignIndex: number | null = null;

  priorityOptions = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' },
  ];
  
  isLoadingBloodbankCampaigns: boolean = false;

  // Subject to manage unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private bloodBankService: BloodBankAccountService
  ) {}

  ngOnInit(): void {
    this.loadBloodBank();

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipcode: ['', Validators.required],
      phone: ['', Validators.required],
      cnpj: ['', Validators.required],
      description: [''],
      website: [''],
    });

    this.campaignForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['medium', Validators.required],
      active: [true],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBloodBank(): void {
    this.isLoading = true;
    this.error = null;

    this.bloodBankService.getBloodBank()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.bloodBank = data;
        this.fillProfileForm(data);
        if (!this.bloodBank.campaigns) {
            this.bloodBank.campaigns = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Falha ao carregar dados.';
        this.isLoading = false;
      },
    });
  }

  private fillProfileForm(data: BloodBank): void {
    this.profileForm.patchValue({
      name: data.name,
      email: data.email,
      street: data.address?.street || '',
      city: data.address?.city || '',
      state: data.address?.state || '',
      zipcode: data.address?.zipCode || '',
      phone: data.phone,
      cnpj: data.cnpj,
      description: data.description || '',
      website: data.website || '',
    });
  }

  getFormattedPhone(phone: string | undefined): string {
    if (!phone) return 'Não informado';
    const value = phone.replace(/\D/g, '');
    if (value.length > 10) return value.replace(/^(\d\d)(\d)(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
    else if (value.length > 5) return value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    return value;
  }

  getFormattedCNPJ(cnpj: string | undefined): string {
    if (!cnpj) return 'Não informado';
    const value = cnpj.replace(/\D/g, '');
    if (value.length <= 14) return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    return value;
  }

  formatPhone(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    if (value.length > 10) value = value.replace(/^(\d\d)(\d)(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
    else if (value.length > 5) value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (value.length > 2) value = value.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');
    input.value = value;
    this.profileForm.get('phone')?.setValue(value, { emitEvent: false });
  }

  formatCEP(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.substring(0, 8);
    if (value.length > 5) value = value.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
    input.value = value;
    this.profileForm.get('zipcode')?.setValue(value, { emitEvent: false });
  }

  formatCNPJ(event: any): void {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 14) value = value.substring(0, 14);
    if (value.length > 12) value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2}).*/, '$1.$2.$3/$4-$5');
    else if (value.length > 8) value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
    else if (value.length > 5) value = value.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
    input.value = value;
    this.profileForm.get('cnpj')?.setValue(value, { emitEvent: false });
  }

  private clean(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/\D/g, '');
  }


  onEditProfile(): void {
    this.editProfileMode = true;
    this.successMessage = null;
  }

  cancelEdit(): void {
    this.editProfileMode = false;
    if (this.bloodBank) {
      this.fillProfileForm(this.bloodBank);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const formValues = this.profileForm.getRawValue();

    const updatedProfile: Partial<BloodBank> = {
      ...this.bloodBank,
      ...formValues,
      phone: this.clean(formValues.phone),
      cnpj: this.clean(formValues.cnpj),
      address: {
        street: formValues.street,
        city: formValues.city,
        state: formValues.state,
        zipCode: this.clean(formValues.zipcode)
      }
    };

    this.bloodBankService.updateBloodBank(updatedProfile)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (updated) => {
        this.bloodBank = updated;
        this.editProfileMode = false;
        this.isLoading = false;
        this.successMessage = 'Perfil atualizado com sucesso.';
      },
      error: (err) => {
        this.error = 'Falha ao atualizar perfil.';
        this.isLoading = false;
      },
    });
  }


  addCampaign(): void {
    this.addCampaignMode = true;
    this.editCampaignMode = false;
    this.campaignForm.reset({ priority: 'medium', active: true });
    this.successMessage = null;
  }

  editCampaign(campaign: Campaign, index: number): void {
    this.editCampaignMode = true;
    this.addCampaignMode = false;
    this.editingCampaignIndex = index;
    this.campaignForm.patchValue(campaign);
    this.successMessage = null;
  }

  cancelCampaignForm(): void {
    this.addCampaignMode = false;
    this.editCampaignMode = false;
    this.editingCampaignIndex = null;
    this.campaignForm.reset();
  }

  saveCampaign(): void {
    if (this.campaignForm.invalid || !this.bloodBank) return;

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const campaignData: Campaign = this.campaignForm.value;
    let currentCampaigns = this.bloodBank.campaigns ? [...this.bloodBank.campaigns] : [];

    if (this.editCampaignMode && this.editingCampaignIndex !== null) {
      const original = currentCampaigns[this.editingCampaignIndex];
      currentCampaigns[this.editingCampaignIndex] = { ...original, ...campaignData };
    } else {
      currentCampaigns.push(campaignData);
    }

    const updatedBloodBank: Partial<BloodBank> = {
        ...this.bloodBank,
        campaigns: currentCampaigns
    };

    this.bloodBankService.updateBloodBank(updatedBloodBank)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
        next: (updated) => {
            this.bloodBank = updated;
            this.isLoading = false;
            this.successMessage = this.editCampaignMode ? 'Campanha atualizada!' : 'Campanha criada!';
            this.cancelCampaignForm();
        },
        error: (err) => {
            this.error = 'Erro ao salvar campanha.';
            this.isLoading = false;
        }
    });
  }

  removeCampaign(campaign: Campaign): void {
    if (!this.bloodBank || !this.bloodBank.campaigns) return;
    
    if(!confirm(`Deseja excluir a campanha "${campaign.title}"?`)) return;

    this.isLoading = true;
    const updatedCampaigns = this.bloodBank.campaigns.filter(c => c !== campaign);

    const updatedBloodBank: Partial<BloodBank> = {
        ...this.bloodBank,
        campaigns: updatedCampaigns
    };

    this.bloodBankService.updateBloodBank(updatedBloodBank)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
        next: (updated) => {
            this.bloodBank = updated;
            this.isLoading = false;
            this.successMessage = 'Campanha removida com sucesso.';
        },
        error: (err) => {
            this.error = 'Erro ao remover campanha.';
            this.isLoading = false;
        }
    });
  }

  getPriorityLabel(value: string): string {
    const option = this.priorityOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(form: FormGroup, field: string): string | null {
    return null;
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.bloodBank) {
          this.bloodBank.photoUrl = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}