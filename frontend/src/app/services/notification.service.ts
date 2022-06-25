import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly http: HttpClient) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addPushSubscriber(sub: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/notification/subscribe`, sub);
  }

  getIndex(): Observable<HttpResponse<string>>{
    return this.http.get<string>(`${environment.baseUrl}/notification`, {
      observe: 'response'
    });
  }

  send(): Observable<string> {
    return this.http.post<string>(`${environment.baseUrl}/notification`, {
      observe: 'response'
    });
  }
}
