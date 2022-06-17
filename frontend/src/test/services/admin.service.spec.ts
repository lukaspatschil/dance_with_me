import { TestBed } from '@angular/core/testing';

import { AdminService } from '../../app/services/admin.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ValidationEnum } from '../../app/enums/validation.enum';
import { environment } from '../../environments/environment';
import { ValidationResponseDto } from '../../app/dto/validationResponse.dto';
import { ValidationRequestDto } from '../../app/dto/validationRequest.dto';
import { ValidationRequestEntity } from '../../app/entities/validationRequestEntity';

describe('AdminService', () => {
  let sut: AdminService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    sut = TestBed.inject(AdminService);
  });

  afterEach(() => {
    httpTestingController.verify(); //Verifies that no requests are outstanding.
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('getAllRequests', () => {
    it('should call the url', () => {
      // Given
      const dtos = [getDto()];

      // When
      sut.getAllRequests().subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest`);
      req.flush(dtos);
    });

    it('should be GET', () => {
      // Given
      const dtos = [getDto()];

      // When
      sut.getAllRequests().subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest`);
      req.flush(dtos);
      expect(req.request.method).toBe('GET');
    });

    it('should return the body', () => {
      // Given
      const dtos = [getDto()];
      const mock = jest.fn();

      // When
      sut.getAllRequests().subscribe(mock);

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest`);
      req.flush(dtos);
      expect(mock).toHaveBeenCalledWith([getEntity()]);
    });
  });

  describe('updateRequest', () => {
    it('should update a request', () => {
      // Given
      const id = '1';
      const status = ValidationEnum.APPROVED;
      const comment = 'this is a comment';

      // When
      sut.updateRequest(id, status, comment).subscribe(() => {});

      // Then
      httpTestingController.expectOne(`${environment.baseUrl}/validationrequest/${id}`);
    });

    it('should update a request with the correct body', () => {
      // Given
      const id = '1';
      const status = ValidationEnum.APPROVED;
      const comment = 'this is a comment';

      // When
      sut.updateRequest(id, status, comment).subscribe(() => {});

      // Then
      const body = new ValidationResponseDto(status, comment);
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest/${id}`);
      expect(req.request.body).toEqual(body);
    });

    it('should update a request with PATCH', () => {
      // Given
      const id = '1';
      const status = ValidationEnum.APPROVED;
      const comment = 'this is a comment';

      // When
      sut.updateRequest(id, status, comment).subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest/${id}`);
      expect(req.request.method).toEqual('PATCH');
    });
  });

  function getDto(): ValidationRequestDto {
    const dto = new ValidationRequestDto();
    dto.id = '1';
    dto.status = ValidationEnum.PENDING;
    dto.userId = 'google:12345';
    dto.displayName = 'John Doe';
    dto.email = 'john@doe.at';

    return dto;
  }

  function getEntity(): ValidationRequestEntity {
    return new ValidationRequestEntity('1', 'google:12345', 'john@doe.at', 'John Doe', ValidationEnum.PENDING);
  }
});
