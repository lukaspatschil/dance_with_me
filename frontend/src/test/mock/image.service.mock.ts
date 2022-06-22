import { of } from 'rxjs';

export class ImageServiceMock {
  uploadImage = jest.fn().mockReturnValue(of({ status: 201 }));

  getImage = jest.fn().mockReturnValue(of('pic.jpg', 'image/jpeg'));

  getValidationImage = jest.fn().mockReturnValue('http://localhost:3000/image');
}
