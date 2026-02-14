import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectReasonViewModal } from './reject-reason-view-modal';

describe('RejectReasonViewModal', () => {
  let component: RejectReasonViewModal;
  let fixture: ComponentFixture<RejectReasonViewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectReasonViewModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectReasonViewModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
