import { TestBed } from '@angular/core/testing';
import { UserService } from '../../app/services/user.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RoleEnum } from '../../app/enums/role.enum';
import { UserDto } from '../../app/dto/user.dto';
import { environment } from '../../environments/environment';
import { UserEntity } from '../../app/entities/user.entity';

describe('UserService', () => {
  let sut: UserService;

  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    sut = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('updateUser', () => {
    it('should update request the user from the server', () => {
      // Given
      const id = 'test-id';

      // When
      void sut.updateUser(id);

      // Then
      const req = httpMock.expectOne(`${environment.baseUrl}/user/${id}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should update the user with the new data', () => {
      // Given
      const id = 'google:12345';

      // When
      void sut.updateUser(id);

      // Then
      sut.user$.subscribe(user => {
        expect(user).toEqual(userEntity);
      });
      const req = httpMock.expectOne(`${environment.baseUrl}/user/${id}`);
      req.flush(userDto);
    });
  });

  describe('resetUser', () => {
    it('should reset the user', () => {
      // Given
      const id = 'google:12345';
      void sut.updateUser(id);
      const req = httpMock.expectOne(`${environment.baseUrl}/user/${id}`);
      req.flush(userDto);

      // When
      sut.resetUser();

      // Then
      sut.user$.subscribe(user => {
        expect(user).toEqual(null);
      });
    });
  });

  describe('role', () => {
    it('should return null initially', () => {
      // When
      const role = sut.role;

      // Then
      expect(role).toBeNull();
    });

    it('should return the role of the user', () => {
      // Given
      const id = 'google:12345';
      void sut.updateUser(id);
      const req = httpMock.expectOne(`${environment.baseUrl}/user/${id}`);
      req.flush(userDto);
      sut.user$.subscribe(() => {});

      // When
      const role = sut.role;

      // Then
      expect(role).toEqual(RoleEnum.USER);
    });
  });

  describe('get user', () => {
    it('should return null initially', () => {
      // When
      const user = sut.user;

      // Then
      expect(user).toBeNull();
    });

    it('should return the user', () => {
      // Given
      const id = 'google:12345';
      void sut.updateUser(id);
      const req = httpMock.expectOne(`${environment.baseUrl}/user/${id}`);
      req.flush(userDto);
      sut.user$.subscribe(() => {});

      // When
      const user = sut.user;

      // Then
      expect(user).toEqual(userEntity);
    });
  });

  describe('deleteUser', () => {
    it('should delete the user', () => {
      // Given
      const id = 'google:12345';
      void sut.updateUser(id);
      const pre = httpMock.expectOne(`${environment.baseUrl}/user/${id}`);
      pre.flush(userDto);
      sut.user$.subscribe(() => {});

      // When
      const result = sut.deleteUser();

      // Then
      result.subscribe(() => {});
      const req = httpMock.expectOne(`${environment.baseUrl}/user/${id}`);
      req.flush(userDto);
    });

    it('should delete the user undefined', () => {
      // When
      const result = sut.deleteUser();

      // Then
      result.subscribe(() => {});
      const req = httpMock.expectOne(`${environment.baseUrl}/user/undefined`);
      req.flush(userDto);
    });
  });

  const userDto: UserDto = {
    id: 'google:12345',
    displayName: 'Max1',
    firstName: 'Max',
    lastName: 'Hermannus',
    email: 'mail@mail.com',
    emailVerified: true,
    pictureUrl: 'pictureUrl',
    role: RoleEnum.USER
  };

  const userEntity: UserEntity = {
    id: 'google:12345',
    displayName: 'Max1',
    firstName: 'Max',
    lastName: 'Hermannus',
    email: 'mail@mail.com',
    emailVerified: true,
    pictureUrl: 'pictureUrl',
    role: RoleEnum.USER
  };
});
