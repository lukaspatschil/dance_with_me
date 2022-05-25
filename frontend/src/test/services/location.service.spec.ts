import { TestBed } from '@angular/core/testing';

import { LocationService } from '../../app/services/location.service';

describe('LocationService', () => {
  let sut: LocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    sut = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('getLocation', () => {
    it('should return the initial location', () => {
      // When
      const result = sut.location;

      // Then
      expect(result).toBeNull();
    });
  });
});
