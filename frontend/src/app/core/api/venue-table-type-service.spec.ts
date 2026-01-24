import { TestBed } from '@angular/core/testing';

import { VenueTableTypeService } from './venue-table-type-service';

describe('VenueTableTypeService', () => {
  let service: VenueTableTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VenueTableTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
