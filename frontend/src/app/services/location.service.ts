import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

type Coordinates = {
  longitude: number,
  latitude: number
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private _location = new BehaviorSubject<Coordinates | null>(null);
  location$ = this._location.asObservable();

  constructor() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(location => {
        const {longitude, latitude} = location.coords;
        this._location.next({longitude, latitude});
      });
    }
  }

  get location(): Coordinates | null {
    return this._location.getValue();
  }
}
