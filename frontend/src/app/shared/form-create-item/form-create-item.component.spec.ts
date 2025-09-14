import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreateItemComponent } from './form-create-item.component';

describe('FormCreateItemComponent', () => {
  let component: FormCreateItemComponent;
  let fixture: ComponentFixture<FormCreateItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCreateItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCreateItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
