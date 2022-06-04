import { of } from 'rxjs';

export class ImageServiceMock {
  uploadImage = jest.fn().mockReturnValue(of({ status: 201 }));
}
