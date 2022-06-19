import { TestBed } from '@angular/core/testing';
import { ValidationService } from '../../app/services/validation.service';
import { environment } from '../../environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ValidationRequestDto } from '../../app/dto/validationRequest.dto';
import { ValidationEnum } from '../../app/enums/validation.enum';

describe('ValidationService', () => {
  let sut: ValidationService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    sut = TestBed.inject(ValidationService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('validateUser', () => {
    it('should send post request', () => {
      // Given
      const file = new File([''], 'filename', { type: 'image/png' });

      // When
      sut.validateUser(file).subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest`);
      expect(req.request.method).toBe('POST');
    });

    it('should send the file', () => {
      // Given
      const file = new File([''], 'filename', { type: 'image/png' });

      // When
      sut.validateUser(file).subscribe(() => {});

      // Then
      const expectedFormData = new FormData();
      expectedFormData.append('file', file, file.name);
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest`);
      expect(req.request.body).toEqual(expectedFormData);
    });
  });

  describe('getValidation', () => {
    it('should fetch all validation request', () => {
      // When
      sut.getValidationRequest().subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest`);
      req.flush(validationRequest);
    });

    it('should be GET', () => {
      // When
      sut.getValidationRequest().subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/validationrequest`);
      req.flush(validationRequest);
      expect(req.request.method).toBe('GET');
    });
  });
});

const validationRequest: ValidationRequestDto = {
  id: '1',
  status: ValidationEnum.PENDING,
  userId: 'google:12345',
  displayName: 'name',
  email: 'mail@mail.com'
};
