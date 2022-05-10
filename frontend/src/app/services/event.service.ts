import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";

import { environment } from "../../environments/environment"
import { EventDto } from "../dto/event.dto";
import {map, Observable} from "rxjs";
import {EventResponseDto} from "../dto/eventResponse.dto";
import {LocationEntity} from "../entities/location.entity";
import {AddressEntity} from "../entities/address.entity";
import {EventEntity} from "../entities/event.entity";


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

  getEvents(): Observable<EventEntity[]> {
    return this.http.get<EventResponseDto[]>(this.URL_EVENT_BASE).pipe(
      map((eventData) => {
        if(eventData === undefined){
          return []
        } else {
          return eventData.map((entry: EventResponseDto) => {
            if (this.checkIfValid(entry) && this.checkIfAddressValid(entry) && this.checkIfLocationValid(entry)) {
              const location = new LocationEntity(
                entry.location.longitude,
                entry.location.longitude);

              const address = new AddressEntity(
                entry.address.country,
                entry.address.city,
                entry.address.postalcode,
                entry.address.street,
                entry.address.housenumber,
                entry.address.addition);

              const event = new EventEntity(
                entry.id,
                entry.name,
                entry.description,
                location, address,
                entry.price,
                entry.public,
                entry.date,
                entry.starttime,
                entry.endtime,
                entry.category);

              return event
            } else {
              return {} as EventEntity
            }
          }).filter(object => Object.entries(object).length !== 0)
        }
        })
    )
  }

  checkIfValid(value: EventResponseDto): boolean{
    return Boolean(value.id &&
      value.name &&
      value.description &&
      Number.isFinite(value.price) &&
      value.date &&
      value.starttime &&
      value.endtime &&
      value.public &&
      value.category)
  }

  checkIfAddressValid(value: EventResponseDto): boolean{
    return  Boolean (value.address!.street && value.address!.housenumber && value.address!.city && value.address!.country && value.address!.postalcode)
  }

  checkIfLocationValid(value: EventResponseDto): boolean {
    return Boolean(Number.isFinite(value.location!.longitude) && Number.isFinite(value.location!.latitude))
  }
}
