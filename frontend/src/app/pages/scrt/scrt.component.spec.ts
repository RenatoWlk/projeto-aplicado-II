import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrtComponent } from './scrt.component';

describe('ScrtComponent', () => {
  let component: ScrtComponent;
  let fixture: ComponentFixture<ScrtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
