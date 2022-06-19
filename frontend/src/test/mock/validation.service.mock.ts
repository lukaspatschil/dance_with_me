import { of } from 'rxjs';
import { ValidationEnum } from '../../app/enums/validation.enum';

export class ValidationServiceMock {
  validateUser = jest.fn().mockReturnValue(of({ status: 201 }));

  getValidationRequest = jest.fn().mockReturnValue(of([
    {
      id: '1',
      status: ValidationEnum.PENDING,
      userId: 'google:12345',
      displayName: 'name',
      email: 'mail@mail.com'
    }
  ]));

}
