import { HttpClient, HttpParams } from "@angular/common/http";
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
    bloodBankId: string;
    date: string;
    hour: string; 
    slot: number;
}

export interface BloodBankAvailability {
    id: string,
    availability: DailyAvailability[];
}

export interface DailyAvailability {
    date: string,
    slots: Slot[];
}

export interface Slot {
    time: string,
    availableSpots: number;
} 

@Injectable({
    providedIn: 'root'
})
export class DonationService {
    
    private readonly API = 'api/bloodbanks';
    
    constructor(private http: HttpClient) {}

    // Pega os bancos de sangue que disponbilizaram datas de doação
    getBloodBanksWithAvailableSlots(): Observable<BloodBank[]> {
        return this.http.get<BloodBank[]>(`${this.API}/available-slots`);
    }

    // Complete donation data.
    getAvailableDonationDates(bloodbankId: string): Observable<DailyAvailability[]> {
        return this.http.get<DailyAvailability[]>(
            `${this.API}/available-dates`,
            { params: {bloodbankId}}
        );
    }

    // Envia o agendamento escolhido pelo usuário
    scheduleDonation(appointment: DonationDate): Observable<any> {
        return this.http.post(`${this.API}/schedule`, appointment);
    }

}