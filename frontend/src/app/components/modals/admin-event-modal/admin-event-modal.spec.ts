import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventModal } from './admin-event-modal';

describe('AdminEventModal', () => {
  let component: AdminEventModal;
  let fixture: ComponentFixture<AdminEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEventModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEventModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
