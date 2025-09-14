import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloodbankCalendarComponent } from './bloodbank-calendar.component';

describe('BloodbankCalendarComponent', () => {
  let component: BloodbankCalendarComponent;
  let fixture: ComponentFixture<BloodbankCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodbankCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloodbankCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
