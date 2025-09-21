import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface DonationSlots {
    id: string,
    availabilitySlots: { date: string,slots: { time: string, availableSpots: number, }[], } [],
}

@Injectable({
    providedIn: 'root'
})
export class BloodbankService {
    constructor(
        private http: HttpClient,
    ) {}

    addAvailableSlots(slot : DonationSlots): Observable<any> {
        console.log('slot', slot);
        return this.http.post<DonationSlots>(`/api/bloodbanks/availability`, slot);
    }
}