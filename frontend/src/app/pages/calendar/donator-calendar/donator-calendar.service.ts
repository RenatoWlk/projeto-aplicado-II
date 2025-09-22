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

    // Pega as datas disponibilizidas para doação, a partir do id do banco de sangue
    getAvailableDonationDates(bloodbankId: string): Observable<{date: string}[]> {
        return this.http.get<{date: string}[]>(
            `${this.API}/available-dates`,
            { params: {bloodbankId} }
        );
    }

    // Pega os horários e número de vagas disponiveis para doação, a partir do id do banco de sangue e a data escolhida pelo usuário
    getAvailableDonationHours(bloodbankId: string, date: string): Observable<{ time: string; availableSpots: number }[]> {
        return this.http.get<{ time: string; availableSpots: number }[]>(`${this.API}/available-hours`, {
            params: {bloodbankId, date}
        });
    }

    // Envia o agendamento escolhido pelo usuário
    scheduleDonation(appointment: DonationDate): Observable<any> {
        return this.http.post(`${this.API}/schedule`, appointment);
    }

}