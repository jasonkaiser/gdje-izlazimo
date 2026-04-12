import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingModal } from './rating-modal';

describe('RatingModal', () => {
  let component: RatingModal;
  let fixture: ComponentFixture<RatingModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RatingModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
