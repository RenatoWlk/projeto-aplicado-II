import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BloodBankDashboardService } from "../../dashboard/bloodbank-dashboard/bloodbank-dashboard.service";
import { DonationSlots } from "../bloodbank-calendar/bloodbank-calendar.service";

export interface BloodBank {
    id: string;
    name: string;
    address: any;
    availabilitySlots: any;
}

export interface DonationDate {
    userId: string;
    bloodBankId: string | null;
    date: string;
    hour: string; 
}

@Injectable({
    providedIn: 'root'
})
export class DonationService {
    
    private readonly API = 'api/bloodbanks';
    
    constructor(private http: HttpClient) {}

    getBloodBanksWithAvailableSlots(): Observable<BloodBank[]> {
        return this.http.get<BloodBank[]>(`${this.API}/available-slots`);
    }

    scheduleDonation(appointment: DonationDate): Observable<any> {
        return this.http.post(`${this.API}/schedule`, appointment);
    }

    getSlotsByBloodBankId(): Observable<DonationSlots[]> {
        return this.http.get<DonationSlots[]>(`${this.API}/available-dates`);
    }

    getAvailableDonationDates(bloodBankId: string): Observable<{ startDate: string; endDate: string }[]> {
    return this.http.get<{ startDate: string; endDate: string }[]>(`${this.API}/available-dates`, {
        params: { bloodBankId }
        });
    }

    getAvailableDonationHours(): Observable<{ startTime: string; endTime: string }[]> {
        return this.http.get<{ startTime: string; endTime: string }[]>(`${this.API}/available-hours`);
    }

}