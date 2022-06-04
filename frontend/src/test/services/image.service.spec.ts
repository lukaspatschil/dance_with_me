import { TestBed } from '@angular/core/testing';

import { ImageService } from '../../app/services/image.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('ImageService', () => {
  let sut: ImageService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    sut = TestBed.inject(ImageService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('uploadImage', () => {
    it('should send post request', () => {
      // Given
      const file = new File([''], 'filename', { type: 'image/png' });

      // When
      sut.uploadImage(file).subscribe(() => {});

      // Then
      const req = httpTestingController.expectOne(`${environment.baseUrl}/image`);
      expect(req.request.method).toBe('POST');
    });

    it('should send the file', () => {
      // Given
      const file = new File([''], 'filename', { type: 'image/png' });

      // When
      sut.uploadImage(file).subscribe(() => {});

      // Then
      const expectedFormData = new FormData();
      expectedFormData.append('file', file, file.name);
      const req = httpTestingController.expectOne(`${environment.baseUrl}/image`);
      expect(req.request.body).toEqual(expectedFormData);
    });
  });
});
