import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, concat } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MapConstants } from './constants/map.constants'; 
import { Address } from '../dashboard/dashboard.service';

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  address: Address;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(private http: HttpClient) {}

  getUserLocation(userId: string): Observable<Location> {
    return this.http.get<Location>(`/api/users/${userId}/location`).pipe(
      catchError(() => of())
    );
  }

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(MapConstants.GET_LOCATIONS_ENDPOINT).pipe(
      catchError(() => of([]))
    );
  }
}
