import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonatorCalendarComponent } from './donator-calendar.component';

describe('DonatorCalendarComponent', () => {
  let component: DonatorCalendarComponent;
  let fixture: ComponentFixture<DonatorCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonatorCalendarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DonatorCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
