import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserEntity } from '../entities/user.entity';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";

import {UserDto} from "../dto/user.dto";
import { environment } from '../../environments/environment';
import {UserMapper} from "../mapper/user.mapper";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly _user = new BehaviorSubject<UserEntity | null>(null);

  public readonly user$ = this._user.asObservable();

  constructor(private readonly http: HttpClient) {}

  updateUser(userId: string) {
    this.http.get<UserDto>(`${environment.baseUrl}/user/${userId}`).subscribe(user => {
      const userEntity = UserMapper.dtoToEntity(user);
      this._user.next(userEntity);
    });
  }

  resetUser() {
    this._user.next(null);
  }

  deleteUser(){
    let id = this._user.value?.id
    return this.http.delete(`${environment.baseUrl}/user/${id}`, {
      observe: 'response'
    })
  }
}
