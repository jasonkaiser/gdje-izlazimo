import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTableTypes } from './admin-table-types';

describe('AdminTableTypes', () => {
  let component: AdminTableTypes;
  let fixture: ComponentFixture<AdminTableTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTableTypes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTableTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
