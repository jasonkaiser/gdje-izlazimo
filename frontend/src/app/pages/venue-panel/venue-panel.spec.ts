import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenuePanel } from './venue-panel';

describe('VenuePanel', () => {
  let component: VenuePanel;
  let fixture: ComponentFixture<VenuePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenuePanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VenuePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
