import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueReservationCard } from './venue-reservation-card';

describe('VenueReservationCard', () => {
  let component: VenueReservationCard;
  let fixture: ComponentFixture<VenueReservationCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueReservationCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueReservationCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
