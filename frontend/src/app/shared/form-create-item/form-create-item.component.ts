import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-create-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-create-item.component.html',
  styleUrls: ['./form-create-item.component.scss']
})
export class FormCreateItemComponent implements OnInit, OnChanges {
  @Input() type: 'offer' | 'post' = 'post';
  @Output() submitForm = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
    this.updateValidators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type']) {
      this.updateValidators();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      validUntil: [''],
      discountPercentage: [0]
    });
  }

  private updateValidators(): void {
    const discountControl = this.form.get('discountPercentage');
    const validUntil = this.form.get('validUntil');
    const startControl = this.form.get('startDate');
    const endControl = this.form.get('endDate');

    if (!discountControl || !startControl || !validUntil || !endControl) return;

    if (this.isOffer) {
      discountControl.setValidators([Validators.min(1), Validators.max(100)]);
      validUntil.setValidators([Validators.required]);
    } else {
      discountControl.clearValidators();
      validUntil.clearValidators();
    }

    if (this.isPost) {
      startControl.setValidators([Validators.required]);
      endControl.setValidators([Validators.required])
    } else {
      startControl.clearValidators();
      endControl.clearValidators();
    }

    discountControl.updateValueAndValidity();
    validUntil.updateValueAndValidity();
    startControl.updateValueAndValidity();
    endControl.updateValueAndValidity();
  }

  get isOffer(): boolean {
    return this.type === 'offer';
  }

  get isPost(): boolean {
    return this.type === 'post';
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.submitForm.emit(this.form.value);
      this.form.reset({ discountPercentage: 0 });
    }
  }
}
