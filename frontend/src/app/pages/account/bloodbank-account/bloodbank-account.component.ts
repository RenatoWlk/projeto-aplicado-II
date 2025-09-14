import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BloodBank, Campaign, BloodBankAccountService } from './bloodbank-account.service';
import { CommonModule } from '@angular/common';
import { BloodBankDashboardService } from '../../dashboard/bloodbank-dashboard/bloodbank-dashboard.service'; 

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
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];
isLoadingBloodbankCampaigns: any;

  constructor(
    private fb: FormBuilder,
    private bloodBankService: BloodBankAccountService
  ) {}

  ngOnInit(): void {
    this.loadBloodBank();

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      address: ['', Validators.required],
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

  private loadBloodBank(): void {
    this.isLoading = true;
    this.error = null;

    this.bloodBankService.getBloodBank().subscribe({
      next: (data) => {
        this.bloodBank = data;
        this.fillProfileForm(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load blood bank data.';
        this.isLoading = false;
      },
    });
  }

  private fillProfileForm(data: BloodBank): void {
    this.profileForm.patchValue({
      name: data.name,
      email: data.email,
      address: data.address?.street || '',
      phone: data.phone,
      cnpj: data.cnpj,
      description: data.description || '',
      website: data.website || '',
    });
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

    const updatedProfile: Partial<BloodBank> = {
      ...this.profileForm.getRawValue(),
    };

    this.bloodBankService.updateBloodBank(updatedProfile).subscribe({
      next: (updated) => {
        this.bloodBank = updated;
        this.editProfileMode = false;
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully.';
      },
      error: () => {
        this.error = 'Failed to update profile.';
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
  }

  saveCampaign(): void {
    if (this.campaignForm.invalid) return;

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    const campaignData: Campaign = this.campaignForm.value;

    if (this.editCampaignMode && this.editingCampaignIndex !== null && this.bloodBank?.campaigns) {
      // Editing existing campaign
      const editingCampaign = this.bloodBank.campaigns[this.editingCampaignIndex];
      if (!editingCampaign.id) {
        this.error = 'Invalid campaign ID.';
        this.isLoading = false;
        return;
      }
      const updatedCampaign: Campaign = { ...campaignData, id: editingCampaign.id };

      this.bloodBankService.updateCampaign(updatedCampaign).subscribe({
        next: (updated) => {
          this.bloodBank!.campaigns![this.editingCampaignIndex!] = updated;
          this.isLoading = false;
          this.successMessage = 'Campaign updated successfully.';
          this.cancelCampaignForm();
        },
        error: () => {
          this.error = 'Failed to update campaign.';
          this.isLoading = false;
        },
      });
    } else {
      // Adding new campaign
      this.bloodBankService.addCampaign(campaignData).subscribe({
        next: (created) => {
          if (this.bloodBank) {
            if (!this.bloodBank.campaigns) this.bloodBank.campaigns = [];
            this.bloodBank.campaigns.push(created);
          }
          this.isLoading = false;
          this.successMessage = 'Campaign created successfully.';
          this.cancelCampaignForm();
        },
        error: () => {
          this.error = 'Failed to create campaign.';
          this.isLoading = false;
        },
      });
    }
  }

  removeCampaign(campaign: Campaign): void {
    if (!campaign.id || !this.bloodBank) return;

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.bloodBankService.removeCampaign(campaign.id).subscribe({
      next: () => {
        this.bloodBank!.campaigns = this.bloodBank!.campaigns!.filter((c) => c.id !== campaign.id);
        this.isLoading = false;
        this.successMessage = 'Campaign removed successfully.';
      },
      error: () => {
        this.error = 'Failed to remove campaign.';
        this.isLoading = false;
      },
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
    const control = form.get(field);
    if (!control || !control.errors) return null;
    if (control.errors['required']) return 'This field is required.';
    if (control.errors['email']) return 'Invalid email format.';
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

    reader.readAsDataURL(file); // Lê a imagem como Base64
  }
}
}
