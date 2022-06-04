import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private readonly http: HttpClient) {}

  finalizePayment(paymentMethodId: string, eventId: string): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${environment.baseUrl}/payment`, { paymentMethodId, eventId });
  }
}
