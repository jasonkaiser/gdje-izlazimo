import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularEvents } from './popular-events';

describe('PopularEvents', () => {
  let component: PopularEvents;
  let fixture: ComponentFixture<PopularEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
