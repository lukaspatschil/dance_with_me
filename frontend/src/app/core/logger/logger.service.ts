import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  public log(message: any) {
    if (!environment.production) {
      console.log(message);
    }
  }

  public error(message: any) {
    if (!environment.production) {
      console.error(message);
    }
  }

  public warn(message: any) {
    if (!environment.production) {
      console.warn(message);
    }
  }

  public info(message: any) {
    if (!environment.production) {
      console.info(message);
    }
  }

  public debug(message: any) {
    if (!environment.production) {
      console.debug(message);
    }
  }

  public trace(message: any) {
    if (!environment.production) {
      console.trace(message);
    }
  }
}
