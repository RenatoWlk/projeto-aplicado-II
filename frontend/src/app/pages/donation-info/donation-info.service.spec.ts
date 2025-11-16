import { TestBed } from '@angular/core/testing';

import { DonationInfoService } from './donation-info.service';

describe('DonationInfoService', () => {
  let service: DonationInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DonationInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
