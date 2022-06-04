import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ImageDto } from '../dto/image.dto';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private readonly http: HttpClient) {}

  uploadImage(file: File): Observable<ImageDto> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<ImageDto>(`${environment.baseUrl}/image`, formData);
  }
}
