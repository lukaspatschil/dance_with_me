import { ComponentFixture, TestBed } from '@angular/core/testing';

jest.mock('@stripe/stripe-js', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    loadStripe: () => ({ createPaymentMethod: jest.fn().mockReturnValue({
      paymentMethod: {
        id: 'abc12'
      }
    })
    })
  };
});

import { PaymentComponent } from '../../../app/components/payment/payment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../app/services/user.service';
import { UserServiceMock } from '../../mock/user.service.mock';
import { RouterTestingModule } from '@angular/router/testing';
import { PaymentService } from '../../../app/services/payment.service';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentServiceMock } from '../../mock/payment.service.mock';

describe('PaymentComponent', () => {
  let sut: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  let nameElement: HTMLInputElement;
  let streetElement: HTMLInputElement;
  let houseNrElement: HTMLInputElement;
  let zipElement: HTMLInputElement;
  let cityElement: HTMLInputElement;
  let countryElement: HTMLInputElement;
  let additionElement: HTMLInputElement;

  let paymentService: PaymentService;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule, RouterTestingModule, TranslateModule.forRoot()],
      declarations: [ PaymentComponent ],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              get: jest.fn().mockReturnValue('123')
            }
          }
        }
      },
      { provide: UserService, useClass: UserServiceMock },
      { provide: PaymentService, useClass: PaymentServiceMock }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentComponent);
    sut = fixture.componentInstance;
    paymentService = TestBed.inject(PaymentService);
    route = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  beforeEach(async () => {
    await fixture.whenStable();
    nameElement = fixture.debugElement.nativeElement.querySelector('#name');
    streetElement = fixture.debugElement.nativeElement.querySelector('#street');
    houseNrElement = fixture.debugElement.nativeElement.querySelector('#housenumber');
    zipElement = fixture.debugElement.nativeElement.querySelector('#zip');
    cityElement = fixture.debugElement.nativeElement.querySelector('#city');
    countryElement = fixture.debugElement.nativeElement.querySelector('#country');
    additionElement = fixture.debugElement.nativeElement.querySelector('#addition');
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should create the stipe components', () => {
      // Then
      expect(sut.stripe).not.toBeNull();
    });

    it('should create the stipe card', () => {
      // Then
      expect(sut.cardElement).not.toBeNull();
    });

    it('should create the form group', () => {
      // Then
      expect(sut.addressForm).not.toBeNull();
    });
  });

  describe('get name', () => {
    it('should return a control element', () => {
      // When
      const result = sut.name;

      // Then
      expect(result).not.toBeNull();
    });
  });

  describe('get country', () => {
    it('should return a control element', () => {
      // When
      const result = sut.country;

      // Then
      expect(result).not.toBeNull();
    });
  });

  describe('get street', () => {
    it('should return a control element', () => {
      // When
      const result = sut.street;

      // Then
      expect(result).not.toBeNull();
    });
  });

  describe('get city', () => {
    it('should return a control element', () => {
      // When
      const result = sut.city;

      // Then
      expect(result).not.toBeNull();
    });
  });

  describe('get housenumber', () => {
    it('should return a control element', () => {
      // When
      const result = sut.housenumber;

      // Then
      expect(result).not.toBeNull();
    });
  });

  describe('get postalcode', () => {
    it('should return a control element', () => {
      // When
      const result = sut.postalcode;

      // Then
      expect(result).not.toBeNull();
    });
  });

  describe('get addition', () => {
    it('should return a control element', () => {
      // When
      const result = sut.addition;

      // Then
      expect(result).not.toBeNull();
    });
  });

  describe('onSubmit', () => {
    it('should create a new payment methode with stripe and the billing details', async () => {
      // Given
      createValidInput();

      // When
      await sut.onSubmit();

      // Then
      const expected = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        billing_details: {
          address: {
            city: 'city',
            country: 'country',
            line1: 'street 10',
            line2: 'addition',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            postal_code: '1020'
          },
          email: undefined,
          name: 'name'
        },
        card: undefined,
        type: 'card'
      };
      expect(sut.stripe?.createPaymentMethod).toHaveBeenCalledWith(expected);
    });

    it('should not create a payment methode when the form is invalid', async () => {
      // Given
      createInvalidInput();

      // When
      await sut.onSubmit();

      // Then
      expect(sut.stripe?.createPaymentMethod).not.toHaveBeenCalled();
    });

    it('should finalize the payment for the given event', async () => {
      // Given
      createValidInput();

      // When
      await sut.onSubmit();

      // Then
      expect(paymentService.finalizePayment).toHaveBeenCalledWith('abc12', '123');
    });

    it('should set the error if the event id is missing', async () => {
      // Given
      createValidInput();
      jest.spyOn(route.snapshot.paramMap, 'get').mockReturnValue(null);

      // When
      await sut.onSubmit();

      // Then
      expect(sut.error).toBe(true);
    });
  });

  function createValidInput(): void {
    nameElement.value = 'name';
    streetElement.value = 'street';
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    houseNrElement.value = String(10);
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    zipElement.value = String(1020);
    cityElement.value = 'city';
    countryElement.value = 'country';
    additionElement.value = 'addition';

    nameElement.dispatchEvent(new Event('input'));
    streetElement.dispatchEvent(new Event('input'));
    houseNrElement.dispatchEvent(new Event('input'));
    zipElement.dispatchEvent(new Event('input'));
    cityElement.dispatchEvent(new Event('input'));
    countryElement.dispatchEvent(new Event('input'));
    additionElement.dispatchEvent(new Event('input'));
  }

  function createInvalidInput(): void {
    nameElement.value = '';
    streetElement.value = 'street';
    houseNrElement.value = '1';
    zipElement.value = '1020';
    cityElement.value = 'city';
    countryElement.value = 'country';
    additionElement.value = 'addition';

    nameElement.dispatchEvent(new Event('input'));
    streetElement.dispatchEvent(new Event('input'));
    houseNrElement.dispatchEvent(new Event('input'));
    zipElement.dispatchEvent(new Event('input'));
    cityElement.dispatchEvent(new Event('input'));
    countryElement.dispatchEvent(new Event('input'));
    additionElement.dispatchEvent(new Event('input'));
  }
});
