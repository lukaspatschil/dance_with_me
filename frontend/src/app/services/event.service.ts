import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";

import { environment } from "../../environments/environment"
import { EventDto } from "../dto/event.dto";
import {map, Observable} from "rxjs";
import {EventResponseDto} from "../dto/eventResponse.dto";
import {EventEntity} from "../entities/event.entity";
import {EventMapper} from "../mapper/event.mapper"


@Injectable({
  providedIn: 'root'
})
export class EventService {

  public URL_EVENT_BASE = `${environment.baseUrl}/event`;

  constructor(private http: HttpClient) {
  }

  createEvent(event: EventDto) {
    return this.http.post<EventDto>(this.URL_EVENT_BASE, event, {
      observe: 'response',
      responseType: 'json'
    })
  }

  getEvent(id: string): Observable<EventEntity>{
    return this.http.get<EventResponseDto>(this.URL_EVENT_BASE + "/" + id).pipe(
      map(event => {
        return EventMapper.mapEventDtoToEntity(event)
      }))
  }

  getEvents(): Observable<EventEntity[]> {
    return this.http.get<EventResponseDto[]>(this.URL_EVENT_BASE).pipe(
      map((eventData) => {
        if(eventData === undefined){
          return []
        } else {
          return eventData.map((entry: EventResponseDto) => {
            return EventMapper.mapEventDtoToEntity(entry)
          }).filter(object => Object.entries(object).length !== 0)
        }
        })
    )
  }
}
