import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodbankAccountComponent } from './bloodbank-account.component';

describe('BloodbankAccountComponent', () => {
  let component: BloodbankAccountComponent;
  let fixture: ComponentFixture<BloodbankAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodbankAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodbankAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
