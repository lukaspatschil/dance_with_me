import { requiredImageType } from '../../app/validators/requiredImageType';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

describe('requiredImageType', () => {
  let sut: (control: AbstractControl) => ValidationErrors | null;

  beforeEach(() => {
    sut = requiredImageType();
  });

  it('should not validate a non existing value', () => {
    // Given
    const formControl = new FormControl();

    // When
    const result = sut(formControl);

    // Given
    expect(result).toBeNull();
  });

  it('should not validate a non supported type', () => {
    // Given
    const formControl = new FormControl({ mimetype: 'application/toolbook' });

    // When
    const result = sut(formControl);

    // Given
    expect(result).toEqual({ wrongType: true });
  });

  it('should validate an JPEG with they mimetype', () => {
    // Given
    const formControl = new FormControl({ mimetype: 'image/jpeg' });

    // When
    const result = sut(formControl);

    // Given
    expect(result).toBeNull();
  });

  it('should validate an PNG with they mimetype', () => {
    // Given
    const formControl = new FormControl({ mimetype: 'image/png' });

    // When
    const result = sut(formControl);

    // Given
    expect(result).toBeNull();
  });
});
