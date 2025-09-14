import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Partner, Offer, PartnerAccountService } from './partner-account.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partner-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './partner-account.component.html',
  styleUrls: ['./partner-account.component.scss']
})
export class PartnerAccountComponent implements OnInit {
  partnerUser: Partner | null = null;

  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  editProfileMode = false;

  profileForm!: FormGroup;
  offerForm!: FormGroup;

  addOfferMode = false;
  editOfferMode = false;
  editingOfferIndex: number | null = null;

  offersCount = 0;
  activeOffersCount = 0;

  constructor(
    private partnerService: PartnerAccountService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadPartner();
    this.initProfileForm();
    this.initOfferForm();
  }

  private loadPartner(): void {
    this.isLoading = true;
    this.partnerService.getPartner().subscribe({
      next: (partner) => {
        this.partnerUser = partner;
        this.updateOfferStats();
        this.patchProfileForm();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load partner data.';
        this.isLoading = false;
      }
    });
  }

  private updateOfferStats(): void {
    if (!this.partnerUser?.offers) {
      this.offersCount = 0;
      this.activeOffersCount = 0;
      return;
    }
    this.offersCount = this.partnerUser.offers.length;
  }

  private initProfileForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      cnpj: ['', Validators.required],
      description: [''],
      website: ['']
    });
  }

  private patchProfileForm(): void {
    if (!this.partnerUser) return;
    this.profileForm.patchValue({
      name: this.partnerUser.name,
      email: this.partnerUser.email,
      address: this.partnerUser.address?.street || '',
      phone: this.partnerUser.phone,
      cnpj: this.partnerUser.cnpj
    });
  }

  private initOfferForm(): void {
    this.offerForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      discountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      validUntil: [''],
      termsAndConditions: [''],
      active: [true]
    });
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const control = form.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string | null {
    const control = form.get(fieldName);
    if (!control || !control.errors) return null;

    if (control.errors['required']) return 'This field is required.';
    if (control.errors['email']) return 'Invalid email format.';
    if (control.errors['min']) return `Minimum value is ${control.errors['min'].min}.`;
    if (control.errors['max']) return `Maximum value is ${control.errors['max'].max}.`;
    return null;
  }

  onEditProfile(): void {
    this.editProfileMode = true;
    this.successMessage = null;
    this.error = null;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    const updatedProfile = this.profileForm.value;

    this.partnerService.updatePartner(updatedProfile).subscribe({
      next: (updated) => {
        this.partnerUser = updated;
        this.patchProfileForm();
        this.editProfileMode = false;
        this.successMessage = 'Profile updated successfully.';
        this.error = null;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to update profile.';
        this.successMessage = null;
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

  onPhotoSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = () => {
      if (this.partnerUser) {
        this.partnerUser.photoUrl = reader.result as string;
      }
    };

    reader.readAsDataURL(file); // Lê a imagem como Base64
  }
}

  addOffer(): void {
    this.addOfferMode = true;
    this.editOfferMode = false;
    this.offerForm.reset({
      title: '',
      description: '',
      discountPercentage: 0,
      validUntil: '',
      termsAndConditions: '',
      active: true
    });
    this.successMessage = null;
    this.error = null;
  }

  editOffer(offer: Offer, index: number): void {
    this.editOfferMode = true;
    this.addOfferMode = false;
    this.editingOfferIndex = index;

    this.offerForm.patchValue({
      title: offer.title,
      description: offer.body,
      discountPercentage: offer.discountPercentage || 0,
      validUntil: offer.validUntil ? this.formatDateForInput(offer.validUntil) : ''
    });

    this.successMessage = null;
    this.error = null;
  }

  saveOffer(): void {
    if (this.offerForm.invalid || !this.partnerUser) return;

    this.isLoading = true;
    const offerData = this.offerForm.value;

    const offerToSave: Offer = {
      title: offerData.title,
      body: offerData.description,
      discountPercentage: offerData.discountPercentage,
      validUntil: offerData.validUntil ? new Date(offerData.validUntil) : null
    };

    if (this.addOfferMode) {
      this.partnerService.addOffer(offerToSave).subscribe({
        next: (updatedOffers) => {
          this.partnerUser!.offers = updatedOffers;
          this.updateOfferStats();
          this.cancelOfferForm();
          this.successMessage = 'Offer created successfully.';
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to create offer.';
          this.successMessage = null;
          this.isLoading = false;
        }
      });
    } else if (this.editOfferMode && this.editingOfferIndex !== null) {
      this.partnerService.updateOffer(this.editingOfferIndex, offerToSave).subscribe({
        next: (updatedOffers) => {
          this.partnerUser!.offers = updatedOffers;
          this.updateOfferStats();
          this.cancelOfferForm();
          this.successMessage = 'Offer updated successfully.';
          this.isLoading = false;
        },
        error: () => {
          this.error = 'Failed to update offer.';
          this.successMessage = null;
          this.isLoading = false;
        }
      });
    }
  }

  cancelOfferForm(): void {
    this.addOfferMode = false;
    this.editOfferMode = false;
    this.editingOfferIndex = null;
    this.offerForm.reset();
    this.error = null;
    this.successMessage = null;
  }

  removeOffer(offer: Offer): void {
    if (!this.partnerUser) return;
    this.isLoading = true;

    this.partnerService.removeOffer(offer).subscribe({
      next: (updatedOffers) => {
        this.partnerUser!.offers = updatedOffers;
        this.updateOfferStats();
        this.successMessage = 'Offer removed successfully.';
        this.error = null;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to remove offer.';
        this.successMessage = null;
        this.isLoading = false;
      }
    });
  }

  isOfferExpired(offer: Offer): boolean {
    if (!offer.validUntil) return false;
    const today = new Date();
    return new Date(offer.validUntil) < today;
  }

  hasOffers(): boolean {
    return !!(this.partnerUser && this.partnerUser.offers && this.partnerUser.offers.length > 0);
  }

  private formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }
}
