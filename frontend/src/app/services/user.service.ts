import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserEntity } from '../entities/user.entity';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { UserDto } from '../dto/user.dto';
import { environment } from '../../environments/environment';
import { UserMapper } from '../mapper/user.mapper';
import { RoleEnum } from '../enums/role.enum';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private readonly _user = new BehaviorSubject<UserEntity | null>(null);

  public readonly user$ = this._user.asObservable();

  constructor(private readonly http: HttpClient) {}


  updateUser(userId: string): void {
    this.http.get<UserDto>(`${environment.baseUrl}/user/${userId}`).subscribe(user => {
      const userEntity = UserMapper.dtoToEntity(user);
      this._user.next(userEntity);
    });
  }

  get user(): UserEntity | null{
    return this._user.getValue();
  }

  get role(): RoleEnum | null {
    return this._user.value?.role ?? null;
  }

  resetUser(): void {
    this._user.next(null);
  }

  deleteUser(): Observable<HttpResponse<UserDto>> {
    let id = this._user.value?.id;
    return this.http.delete<UserDto>(`${environment.baseUrl}/user/${id}`, {
      observe: 'response'
    });
  }
}
