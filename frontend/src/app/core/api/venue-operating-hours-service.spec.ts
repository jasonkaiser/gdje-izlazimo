import { TestBed } from '@angular/core/testing';

import { VenueOperatingHoursService } from './venue-operating-hours-service';

describe('VenueOperatingHoursService', () => {
  let service: VenueOperatingHoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueOperatingHoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
