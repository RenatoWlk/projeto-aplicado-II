import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface DonationSlots {
    id: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
}

@Injectable({
    providedIn: 'root'
})
export class BloodbankService {
    constructor(
        private http: HttpClient,
    ) {}

    addAvailableSlots(slot : DonationSlots): Observable<any> {
        return this.http.post<DonationSlots>(`/api/bloodbanks/availability`, slot);
    }
}