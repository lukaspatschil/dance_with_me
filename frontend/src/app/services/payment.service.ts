import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private readonly http: HttpClient) {}

  finalizePayment(paymentMethodId: string, eventId: string) {
    return this.http.post(`${environment.baseUrl}/payment`, {paymentMethodId, eventId});
  }
}
