import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OdluciZaMene } from './odluci-za-mene';

describe('OdluciZaMene', () => {
  let component: OdluciZaMene;
  let fixture: ComponentFixture<OdluciZaMene>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OdluciZaMene]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OdluciZaMene);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
