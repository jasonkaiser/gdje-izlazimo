import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityLogsModal } from './activity-logs-modal';

describe('ActivityLogsModal', () => {
  let component: ActivityLogsModal;
  let fixture: ComponentFixture<ActivityLogsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityLogsModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityLogsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
