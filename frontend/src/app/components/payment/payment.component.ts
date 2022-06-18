import { Component, OnInit } from '@angular/core';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { PaymentService } from '../../services/payment.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  stripe!: Stripe | null;

  cardElement!: StripeCardElement;

  addressForm!: FormGroup;

  loading = false;

  error = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.addressForm = this.fb.group({
      name: ['', Validators.required],
      address: this.fb.group({
        country: ['', Validators.required],
        street: ['', Validators.required],
        city: ['', Validators.required],
        housenumber: ['', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
        postalcode: ['', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
        addition: []
      })
    });

    this.stripe = await loadStripe(environment.stripeKey);
    this.initStripeElements();
  }

  get name(): AbstractControl {
    return this.addressForm.get('name')!;
  }

  get country(): AbstractControl {
    return this.addressForm.get(['address', 'country'])!;
  }

  get street(): AbstractControl {
    return this.addressForm.get(['address', 'street'])!;
  }

  get city(): AbstractControl {
    return this.addressForm.get(['address', 'city'])!;
  }

  get housenumber(): AbstractControl {
    return this.addressForm.get(['address', 'housenumber'])!;
  }

  get postalcode(): AbstractControl {
    return this.addressForm.get(['address', 'postalcode'])!;
  }

  get addition(): AbstractControl {
    return this.addressForm.get(['address', 'addition'])!;
  }

  private initStripeElements(): void {
    if (this.stripe) {
      const elements = this.stripe.elements();

      // Set up Stripe.js and Elements to use in checkout form
      const style = {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      };

      this.cardElement = elements.create('card', { style });
      this.cardElement.mount('#card-element');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.addressForm.valid) {
      this.loading = true;

      if (this.stripe) {
        const result = await this.stripe.createPaymentMethod({
          type: 'card',
          card: this.cardElement,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          billing_details: {
            // Include any additional collected billing details.
            name: this.name.value,
            email: this.userService.user?.email,
            address: {
              line1: `${this.street.value} ${this.housenumber.value}`,
              line2: `${this.addition.value}`,
              city: this.city.value,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              postal_code: this.postalcode.value,
              country: this.country.value
            }
          }
        });

        const eventId = this.route.snapshot.paramMap.get('id');

        if (result.paymentMethod?.id && eventId) {
          this.paymentService.finalizePayment(result.paymentMethod.id, eventId).subscribe({
            next: () => {
              this.loading = false;
              void this.router.navigate(['/events']);
            }, error: () => {
              this.loading = false;
              this.error = true;
            }
          });
        } else {
          this.loading = false;
          this.error = true;
        }
      }
    }
  }
}
