import { TestBed } from '@angular/core/testing';

import { VenueImageService } from './venue-image-service';

describe('VenueImageService', () => {
  let service: VenueImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
