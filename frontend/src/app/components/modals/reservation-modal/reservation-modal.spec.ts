import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationModal } from './reservation-modal';

describe('ReservationModal', () => {
  let component: ReservationModal;
  let fixture: ComponentFixture<ReservationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReservationModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
