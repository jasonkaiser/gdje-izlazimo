import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationSuccessModal } from './reservation-success-modal';

describe('ReservationSuccessModal', () => {
  let component: ReservationSuccessModal;
  let fixture: ComponentFixture<ReservationSuccessModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationSuccessModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationSuccessModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
