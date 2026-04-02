import { TestBed } from '@angular/core/testing';

import { UserFavoriteVenue } from './user-favorite-venue';

describe('UserFavoriteVenue', () => {
  let service: UserFavoriteVenue;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserFavoriteVenue);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
