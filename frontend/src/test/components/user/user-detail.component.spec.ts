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
import { ValidationService } from '../../../app/services/validation.service';
import { ValidationServiceMock } from '../../mock/validation.service.mock';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ValidationRequestDto } from '../../../app/dto/validationRequest.dto';
import { ValidationEnum } from '../../../app/enums/validation.enum';

describe('UserDetailComponent', () => {
  let comp: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  let userService: UserService;
  let authService: AuthService;
  let validationService: ValidationService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDetailComponent ],
      imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule, RouterTestingModule, TranslateModule.forRoot()],
      providers: [{ provide: UserService, useClass: UserServiceMock },
        { provide: ValidationService, useClass: ValidationServiceMock },
        { provide: AuthService, useClass: AuthServiceMock }]
    })
      .compileComponents();

    userService = TestBed.inject(UserService);
    authService = TestBed.inject(AuthService);
    validationService = TestBed.inject(ValidationService);
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailComponent);
    comp = fixture.componentInstance;
    comp.ngOnInit();
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

  describe('clearImage', () => {
    it('should set the value of image to null', () => {
      // When
      comp.clearImage();

      // Then
      expect(comp.image.value).toBeNull();
    });
  });

  describe('onSubmit', () => {
    it('should not post an image to api when input is invalid ', () => {
      // When
      comp.onSubmit();

      // Then
      expect(validationService.validateUser).not.toHaveBeenCalled();
    });
  });

  describe('getValidationStatus', () => {
    it('should get the validation status of the current user', () => {
      // When
      comp.getValidationStatus();

      // Then
      expect(validationService.getValidationRequest).toHaveBeenCalled();
    });
  });

  it('should get the user from the fetched requests', () => {
    // When
    comp.getValidationStatus();

    // Then
    expect(validationService.getValidationRequest).toHaveBeenCalled();
    expect(comp.validationStatus).toEqual(validationRequest);
  });

});

const validationRequest: ValidationRequestDto = {
  id: '1',
  status: ValidationEnum.PENDING,
  userId: 'google:12345',
  displayName: 'name',
  email: 'mail@mail.com'
};
