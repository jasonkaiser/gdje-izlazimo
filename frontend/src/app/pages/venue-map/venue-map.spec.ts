import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueMap } from './venue-map';

describe('VenueMap', () => {
  let component: VenueMap;
  let fixture: ComponentFixture<VenueMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenueMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
