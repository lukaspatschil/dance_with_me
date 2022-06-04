import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailComponent } from '../../../app/components/user/user-detail/user-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UserServiceMock } from '../../mock/user.service.mock';
import { UserService } from '../../../app/services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../app/core/auth/auth.service';
import { AuthServiceMock } from '../../mock/auth.service.mock';
import { Router } from '@angular/router';

describe('UserDetailComponent', () => {
  let comp: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  let userService: UserService;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDetailComponent ],
      imports: [ HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [{ provide: UserService, useClass: UserServiceMock }, { provide: AuthService, useClass: AuthServiceMock }]
    })
      .compileComponents();

    userService = TestBed.inject(UserService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should fetch user from API ', async () => {
      // When
      jest.spyOn(userService.user$, 'subscribe');

      await fixture.whenStable();
      comp.ngOnInit();

      // Then
      expect(userService.user$.subscribe).toHaveBeenCalled();
    });

  });

  describe('deleteUser', () => {
    it('should delete user from API ', async () => {
      // When
      jest.spyOn(userService, 'deleteUser');

      await fixture.whenStable();
      comp.deleteUser();

      // Then
      expect(userService.deleteUser).toHaveBeenCalled();
    });

    it('should logout after deleting', async () => {
      // When
      await fixture.whenStable();

      // When
      comp.deleteUser();

      // Then
      expect(authService.logout).toHaveBeenCalled();
    });

    it('should redirect after deleting', async () => {
      // When
      jest.spyOn(router, 'navigate');
      await fixture.whenStable();

      // When
      comp.deleteUser();

      // Then
      expect(router.navigate).toHaveBeenCalledWith(['']);
    });
  });

});
