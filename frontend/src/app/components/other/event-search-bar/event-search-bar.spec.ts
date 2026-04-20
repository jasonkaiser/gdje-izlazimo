import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSearchBar } from './event-search-bar';

describe('EventSearchBar', () => {
  let component: EventSearchBar;
  let fixture: ComponentFixture<EventSearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventSearchBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventSearchBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
