import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type LogMessage = unknown;

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  public log(message: LogMessage): void {
    if (!environment.production) {
      console.log(message);
    }
  }

  public error(message: LogMessage): void {
    if (!environment.production) {
      console.error(message);
    }
  }

  public warn(message: LogMessage): void {
    if (!environment.production) {
      console.warn(message);
    }
  }

  public info(message: LogMessage): void {
    if (!environment.production) {
      console.info(message);
    }
  }

  public debug(message: LogMessage): void {
    if (!environment.production) {
      console.debug(message);
    }
  }

  public trace(message: LogMessage): void {
    if (!environment.production) {
      console.trace(message);
    }
  }
}
