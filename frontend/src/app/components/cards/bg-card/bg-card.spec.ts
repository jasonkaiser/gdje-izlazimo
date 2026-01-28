import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BgCard } from './bg-card';

describe('BgCard', () => {
  let component: BgCard;
  let fixture: ComponentFixture<BgCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BgCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BgCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
