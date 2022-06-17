import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { ValidationMapper } from '../mapper/validation.mapper';
import { ValidationRequestDto } from '../dto/validationRequest.dto';
import { ValidationRequestEntity } from '../entities/validationRequestEntity';
import { ValidationResponseDto } from '../dto/validationResponse.dto';
import { ValidationEnum } from '../enums/validation.enum';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private readonly http: HttpClient) {}

  getAllRequests(): Observable<ValidationRequestEntity[]> {
    return this.http.get<ValidationRequestDto[]>(`${environment.baseUrl}/validationrequest`).pipe(
      map((validationData) => {
        return validationData
          .map((entry) => ValidationMapper.dtoToEntity(entry))
          .filter((entry: ValidationRequestEntity | null): entry is ValidationRequestEntity => entry !== null);
      })
    );
  }

  updateRequest(id: string, status: ValidationEnum, comment: string): Observable<ValidationRequestDto> {
    const dto = new ValidationResponseDto(status, comment);
    return this.http.patch<ValidationRequestDto>(`${environment.baseUrl}/validationrequest/${id}`, dto);
  }
}
