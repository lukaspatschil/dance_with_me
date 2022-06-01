import { TestBed } from '@angular/core/testing';

import {RouterTestingModule} from "@angular/router/testing";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {OrganiserGuard} from "../../../../app/core/auth/guards/organiser.guard";
import {UserService} from "../../../../app/services/user.service";
import {UserServiceMock} from "../../../mock/user.service.mock";
import {RoleEnum} from "../../../../app/enums/role.enum";

describe('OrganiserGuard', () => {

  let sut: OrganiserGuard;

  let userService: UserService;

  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [OrganiserGuard, { provide: UserService, useClass: UserServiceMock }]
    });

    sut = TestBed.inject(OrganiserGuard);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should return true if the user is an Organiser', () => {
      // Given
      jest.spyOn(router, 'parseUrl');
      jest.spyOn(userService, 'role', 'get').mockReturnValue(RoleEnum.ORGANISER);
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      const result = sut.canActivate(route, state);

      // Then
      expect(result).toBeTruthy();
    });

    it('should return true if the user is an Admin', () => {
      // Given
      jest.spyOn(router, 'parseUrl');
      jest.spyOn(userService, 'role', 'get').mockReturnValue(RoleEnum.ADMIN);
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      const result = sut.canActivate(route, state);

      // Then
      expect(result).toBeTruthy();
    });

    it('should redirect if the user is not Admin', () => {
      // Given
      jest.spyOn(router, 'parseUrl');
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      sut.canActivate(route, state);

      // Then
      expect(router.parseUrl).toHaveBeenCalledWith(environment.loginUrl);
    });

    it('should return the UrlTree to redirect', () => {
      // Given
      jest.spyOn(router, 'parseUrl');
      const route = {} as unknown as ActivatedRouteSnapshot;
      const state = {} as RouterStateSnapshot;

      // When
      const result = sut.canActivate(route, state);

      // Then
      const expectedUrl = router.parseUrl(environment.loginUrl);
      expect(result).toEqual(expectedUrl);
    });
  });
});
