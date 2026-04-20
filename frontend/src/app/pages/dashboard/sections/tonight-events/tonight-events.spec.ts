import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TonightEvents } from './tonight-events';

describe('TonightEvents', () => {
  let component: TonightEvents;
  let fixture: ComponentFixture<TonightEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TonightEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TonightEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
