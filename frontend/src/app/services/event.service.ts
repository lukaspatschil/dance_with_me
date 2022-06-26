import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EventDto } from '../dto/event.dto';
import { map, Observable } from 'rxjs';
import { EventEntity } from '../entities/event.entity';
import { EventMapper } from '../mapper/event.mapper';
import { CreateEventDto } from '../dto/createEvent.dto';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  public URL_EVENT_BASE = `${environment.baseUrl}/event`;

  constructor(private readonly http: HttpClient) {
  }

  createEvent(event: CreateEventDto): Observable<HttpResponse<EventDto>> {
    return this.http.post<EventDto>(this.URL_EVENT_BASE, event, {
      observe: 'response',
      responseType: 'json'
    });
  }

  getEvent(id: string): Observable<EventEntity | null>{
    return this.http.get<EventDto>(this.URL_EVENT_BASE + '/' + id).pipe(
      map(event => {
        return EventMapper.mapEventDtoToEntity(event);
      }));
  }

  getEvents(longitude: number, latitude: number, radius: number): Observable<EventEntity[]> {
    const params = new HttpParams()
      .set('longitude', longitude)
      .set('latitude', latitude)
      .set('radius', radius);

    return this.http.get<EventDto[]>(this.URL_EVENT_BASE, { params: params }).pipe(
      map((eventData) => {
        let events: EventEntity[] = [];
        events = eventData
          .map((entry: EventDto) => EventMapper.mapEventDtoToEntity(entry))
          .filter((event: EventEntity | null): event is EventEntity => event !== null);
        return events;
      })
    );
  }

  getRecommendation(longitude: number, latitude: number, radius: number): Observable<EventEntity[]> {
    const params = new HttpParams()
      .set('longitude', longitude)
      .set('latitude', latitude)
      .set('radius', radius);

    return this.http.get<EventDto[]>(`${environment.baseUrl}/recommendation`, { params: params }).pipe(
      map((eventData) => {
        return eventData
          .map((entry: EventDto) => EventMapper.mapEventDtoToEntity(entry))
          .filter((event: EventEntity | null): event is EventEntity => event !== null);
      })
    );
  }


  participateOnEvent(eventId: string): Observable<HttpResponse<EventDto>> {
    return this.http.post<EventDto>(`${environment.baseUrl}/event/${eventId}/participation`, {}, {
      observe: 'response'
    });
  }


  deleteParticipateOnEvent(eventId: string): Observable<HttpResponse<EventDto>> {
    return this.http.delete(`${environment.baseUrl}/event/${eventId}/participation`, {
      observe: 'response'
    });
  }

  deleteEvent(eventId: string): Observable<HttpResponse<EventDto>> {
    return this.http.delete(`${environment.baseUrl}/event/${eventId}`, {
      observe: 'response'
    });
  }
}
