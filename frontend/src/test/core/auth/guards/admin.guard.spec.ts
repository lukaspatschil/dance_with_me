import { TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { UserService } from '../../../../app/services/user.service';
import { AdminGuard } from '../../../../app/core/auth/guards/admin.guard';
import { UserServiceMock } from '../../../mock/user.service.mock';
import { RoleEnum } from '../../../../app/enums/role.enum';

describe('AdminGuard', () => {

  let sut: AdminGuard;

  let userService: UserService;

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AdminGuard, { provide: UserService, useClass: UserServiceMock }]
    });

    sut = TestBed.inject(AdminGuard);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true if the user is an Admin', () => {
      // Given
      jest.spyOn(router, 'parseUrl');
      jest.spyOn(userService, 'role', 'get').mockReturnValue(RoleEnum.ADMIN);

      // When
      const result = sut.canActivate();

      // Then
      expect(result).toBeTruthy();
    });

    it('should redirect if the user is not Admin', () => {
      // Given
      jest.spyOn(router, 'parseUrl');

      // When
      sut.canActivate();

      // Then
      expect(router.parseUrl).toHaveBeenCalledWith(environment.loginUrl);
    });

    it('should return the UrlTree to redirect', () => {
      // Given
      jest.spyOn(router, 'parseUrl');

      // When
      const result = sut.canActivate();

      // Then
      const expectedUrl = router.parseUrl(environment.loginUrl);
      expect(result).toEqual(expectedUrl);
    });
  });
});
