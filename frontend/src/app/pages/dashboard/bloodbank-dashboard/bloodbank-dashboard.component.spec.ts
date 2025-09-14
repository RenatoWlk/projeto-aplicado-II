import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodbankDashboardComponent } from './bloodbank-dashboard.component';

describe('BloodbankDashboardComponent', () => {
  let component: BloodbankDashboardComponent;
  let fixture: ComponentFixture<BloodbankDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodbankDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodbankDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
