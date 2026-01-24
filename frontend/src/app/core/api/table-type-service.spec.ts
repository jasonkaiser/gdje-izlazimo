import { TestBed } from '@angular/core/testing';

import { TableTypeService } from './table-type-service';

describe('TableTypeService', () => {
  let service: TableTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
