import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";

import { environment } from "../../environments/environment"
import { Event } from "../models/event";


@Injectable({
  providedIn: 'root'
})
export class EventService {

  public URL_EVENT_BASE = `${environment.baseUrl}/event`;

  constructor(private http: HttpClient) {
  }

  createEvent(event: Event) {
    return this.http.post<Event>(this.URL_EVENT_BASE, event, {
      observe: 'response',
      responseType: 'json'
    })
  }

}
