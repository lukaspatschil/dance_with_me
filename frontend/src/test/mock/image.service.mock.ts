import { of } from 'rxjs';

export class ImageServiceMock {
  uploadImage = jest.fn().mockReturnValue(of({ status: 201 }));

  getValidationImage = jest.fn().mockReturnValue('http://localhost:3000/image');
}
