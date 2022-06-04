import { TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../../app/core/auth/auth.service';
import { AuthServiceMock } from '../../../mock/auth.service.mock';
import { RefreshGuard } from '../../../../app/core/auth/guards/refresh.guard';

describe('RefreshGuard', () => {

  let sut: RefreshGuard;

  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [RefreshGuard, { provide: AuthService, useClass: AuthServiceMock }]
    });

    sut = TestBed.inject(RefreshGuard);
    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true', async () => {
      // When
      const result = await sut.canActivate();

      // Then
      expect(result).toBeTruthy();
    });

    it('should try to refresh the access token if not authenticated', async () => {
      // Given
      authService.isAuthenticated = jest.fn().mockReturnValue(false);

      // When
      await sut.canActivate();

      // Then
      expect(authService.refreshAccessToken).toHaveBeenCalled();
    });
  });
});
