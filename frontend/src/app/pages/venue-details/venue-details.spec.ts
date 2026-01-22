import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueDetails } from './venue-details';

describe('VenueDetails', () => {
  let component: VenueDetails;
  let fixture: ComponentFixture<VenueDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
