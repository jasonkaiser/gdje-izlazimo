import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueModal } from './venue-modal';

describe('VenueModal', () => {
  let component: VenueModal;
  let fixture: ComponentFixture<VenueModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
