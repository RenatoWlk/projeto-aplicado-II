import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CalendarEvent } from "./calendar.model";
import { Injectable } from "@angular/core";

export interface CalendarStats {

    lastDonationDate: Date;
    nextDonationDate: Date;
    daysUntilNextDonation: number;
}

@Injectable({providedIn: 'root'})
export class CalendarService {
    private api = '/api/calendar';

    constructor(private http: HttpClient) {}

    getEvents(date: Date): Observable<CalendarEvent[]> {
        return this.http.get<CalendarEvent[]>(`${this.api}?date=`);
    }

    addEvent(event: CalendarEvent): Observable<CalendarEvent> {
        return this.http.post<CalendarEvent>(this.api, event);
    }

    updateEvent(event: CalendarEvent): Observable<CalendarEvent> {
        return this.http.put<CalendarEvent>(this.api, event);
    }

    deleteEvent(id: number): Observable<void> {
        return this.http.delete<void>(`${this.api}/${id}`);
    }
}