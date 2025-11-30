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
    const phonePattern = /^[\d\(\)\-\s]*$/;
    const docPattern = /^[\d\.\-\/]*$/;

    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],

      phone: ['', [Validators.required, Validators.pattern(phonePattern)]],
      cnpj: ['', [Validators.required, Validators.pattern(docPattern)]],
    });
  }
  
  private patchProfileForm(): void {
    if (!this.partnerUser) return;
    this.profileForm.patchValue({
      name: this.partnerUser.name,
      email: this.partnerUser.email,
      street: this.partnerUser.address?.street || '',
      city: this.partnerUser.address?.city || '',
      state: this.partnerUser.address?.state || '',
      zipcode: this.partnerUser.address?.zipCode || '',
      phone: this.partnerUser.phone,
      cnpj: this.partnerUser.cnpj,
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
    return null;
  }
  private clean(value: string | null | undefined): string {
    if (!value) return '';
    return value.replace(/\D/g, '');
  }

  getFormattedPhone(phone: string | undefined): string {
    if (!phone) return 'Não informado';
    const value = phone.replace(/\D/g, '');
    if (value.length > 10) return value.replace(/^(\d\d)(\d)(\d{4})(\d{4}).*/, '($1) $2 $3-$4');
    else if (value.length > 5) return value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    return value;
  }

  getFormattedCNPJ(cnpj: string | undefined): string {
    if (!cnpj) return '';
        let value = cnpj.replace(/\D/g, '');
    if (value.length > 14) {
      value = value.substring(0, 14);
    }
    if (value.length > 0) {
      return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    }
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

  onEditProfile(): void {
    this.editProfileMode = true;
    this.successMessage = null;
    this.error = null;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    const formValues = this.profileForm.getRawValue();

    const updatedProfile: Partial<Partner> = {
      ...this.partnerUser,
      ...formValues,

      phone: this.clean(formValues.phone),
      cnpj: this.clean(formValues.cnpj),

      address: {
        street: formValues.street,
        city: formValues.city,
        state: formValues.state,
      }
    };

    this.partnerService.updatePartner(updatedProfile).subscribe({
      next: (updated) => {
        this.partnerUser = updated;
        this.patchProfileForm();
        this.editProfileMode = false;
        this.successMessage = 'Perfil atualizado com sucesso.';
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
