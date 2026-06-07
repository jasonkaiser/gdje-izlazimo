import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDateFilter } from './event-date-filter';

describe('EventDateFilter', () => {
  let component: EventDateFilter;
  let fixture: ComponentFixture<EventDateFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDateFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDateFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
