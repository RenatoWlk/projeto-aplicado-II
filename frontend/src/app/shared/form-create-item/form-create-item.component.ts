import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'form-create-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-create-item.component.html',
  styleUrls: ['./form-create-item.component.scss']
})
export class FormCreateItemComponent implements OnInit, OnChanges {
  @Input() type: 'offer' | 'post' | 'reward' = 'post';
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
      discountPercentage: [0],
      requiredPoints: [0],
      stock: [0]
    });
  }

  private updateValidators(): void {
    const discount = this.form.get('discountPercentage');
    const validUntil = this.form.get('validUntil');
    const start = this.form.get('startDate');
    const end = this.form.get('endDate');
    const requiredPoints = this.form.get('requiredPoints');
    const stock = this.form.get('stock');

    if (!discount || !validUntil || !start || !end || !requiredPoints || !stock) return;

    if (this.isOffer) {
      discount.setValidators([Validators.min(1), Validators.max(100)]);
      validUntil.setValidators([Validators.required]);
    } else {
      discount.clearValidators();
      validUntil.clearValidators();
    }

    if (this.isPost) {
      start.setValidators([Validators.required]);
      end.setValidators([Validators.required]);
    } else {
      start.clearValidators();
      end.clearValidators();
    }

    if (this.isReward) {
      requiredPoints.setValidators([Validators.required, Validators.min(1)]);
      stock.setValidators([Validators.required, Validators.min(1)]);
    } else {
      requiredPoints.clearValidators();
      stock.clearValidators();
    }

    discount.updateValueAndValidity();
    validUntil.updateValueAndValidity();
    start.updateValueAndValidity();
    end.updateValueAndValidity();
    requiredPoints.updateValueAndValidity();
    stock.updateValueAndValidity();
  }

  get isOffer(): boolean {
    return this.type === 'offer';
  }

  get isPost(): boolean {
    return this.type === 'post';
  }

  get isReward(): boolean {
    return this.type === 'reward';
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.value;

      if (this.isReward) {
        const payload = {
          title: value.title,
          description: value.body,
          requiredPoints: value.requiredPoints,
          stock: value.stock
        };
        this.submitForm.emit(payload);
      } else {
        this.submitForm.emit(value);
      }

      this.form.reset({ discountPercentage: 0, requiredPoints: 0, stock: 0 });
    }
  }
}
