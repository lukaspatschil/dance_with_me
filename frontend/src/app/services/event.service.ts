import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";

import { environment } from "../../environments/environment"
import { EventDto } from "../dto/event.dto";
import {map, Observable} from "rxjs";
import {EventEntity} from "../entities/event.entity";
import {EventMapper} from "../mapper/event.mapper"
import {CreateEventDto} from "../dto/createEvent.dto";


@Injectable({
  providedIn: 'root'
})
export class EventService {

  public URL_EVENT_BASE = `${environment.baseUrl}/event`;

  constructor(private http: HttpClient) {
  }

  createEvent(event: CreateEventDto) {
    return this.http.post<EventDto>(this.URL_EVENT_BASE, event, {
      observe: 'response',
      responseType: 'json'
    })
  }

  getEvent(id: string): Observable<EventEntity | null>{
    return this.http.get<EventDto>(this.URL_EVENT_BASE + "/" + id).pipe(
      map(event => {
        return EventMapper.mapEventDtoToEntity(event)
      }))
  }

  getEvents(): Observable<EventEntity[]> {
    return this.http.get<EventDto[]>(this.URL_EVENT_BASE).pipe(
      map((eventData) => {
        let events: EventEntity[] = [];
        if(eventData){
          events = eventData
            .map((entry: EventDto) => EventMapper.mapEventDtoToEntity(entry))
            .filter((event: EventEntity | null): event is EventEntity => event !== null);
        }
        return events;
      })
    )
  }
}
