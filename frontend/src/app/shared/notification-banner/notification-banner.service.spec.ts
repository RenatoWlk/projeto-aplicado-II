import { TestBed } from '@angular/core/testing';

import { NotificationBannerService } from './notification-banner.service';

describe('NotificationBannerService', () => {
  let service: NotificationBannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationBannerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
