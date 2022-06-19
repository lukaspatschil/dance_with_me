import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ValidationRequestDto } from '../dto/validationRequest.dto';
import { ValidationRequestEntity } from '../entities/validationRequestEntity';
import { ValidationMapper } from '../mapper/validation.mapper';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor(private readonly http: HttpClient) {}

  validateUser(file: File): Observable<HttpResponse<string>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<string>(`${environment.baseUrl}/validationrequest`, formData, {
      observe: 'response'
    });
  }

  getValidationRequest(): Observable<ValidationRequestEntity[]> {
    return this.http.get<ValidationRequestDto[]>(`${environment.baseUrl}/validationrequest`).pipe(
      map((validationData) => {
        return validationData
          .map((entry) => ValidationMapper.dtoToEntity(entry))
          .filter((entry: ValidationRequestEntity | null): entry is ValidationRequestEntity => entry !== null);
      })
    );
  }
}
