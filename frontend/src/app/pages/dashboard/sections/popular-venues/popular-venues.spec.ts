import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularVenues } from './popular-venues';

describe('PopularVenues', () => {
  let component: PopularVenues;
  let fixture: ComponentFixture<PopularVenues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularVenues]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularVenues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
