import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BloodBankDashboardService } from "../../dashboard/bloodbank-dashboard/bloodbank-dashboard.service";
// import { DonationSlots } from "../bloodbank-calendar/bloodbank-calendar.service";

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

export interface BloodBank {
    id: string;
    name: string;
    address: any;
    phone: string;
    email: string;
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

export enum DonationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export interface DonationResponse {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  bloodBankId: string;
  bloodBankName?: string;
  bloodBankAddress?: string;
  date: string;
  hour: string;
  slot: number;
  bloodType: string;
  status: DonationStatus;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SlotAvailability {
  available: boolean;
  slotsUsed: number;
  slotsRemaining: number;
}

@Injectable({
    providedIn: 'root'
})
export class DonationService {
    
    private readonly BLOODBANK_API = 'api/bloodbanks';
    private readonly DONATION_API = 'api/donations';

    constructor(private http: HttpClient) {}

    // Pega os bancos de sangue que disponbilizaram datas de doação
    getBloodBanksWithAvailableSlots(): Observable<BloodBank[]> {
        return this.http.get<BloodBank[]>(`${this.BLOODBANK_API}/available-slots`);
    }

    // Complete donation data.
    getAvailableDonationDates(bloodbankId: string): Observable<DailyAvailability[]> {
        return this.http.get<DailyAvailability[]>(
            `${this.BLOODBANK_API}/available-dates`,
            { params: {bloodbankId}}
        );
    }

    /**
     * Envia o agendamento escolhido pelo usuário
     */
    scheduleDonation(appointment: DonationDate): Observable<DonationResponse> {
        return this.http.post<DonationResponse>(this.DONATION_API, appointment);
    }

    /**
     * Buscar agendamentos de um usuário
     */
    getUserDonations(userId: string, activeOnly: boolean = false): Observable<DonationResponse[]> {
        const params = new HttpParams().set('activeOnly', activeOnly.toString());
        return this.http.get<DonationResponse[]>(
            `${this.DONATION_API}/user/${userId}`, 
            { params }
        );
    }

    /**
     * Buscar agendamentos de um banco de sangue
     */
    getBloodBankDonations(
        bloodBankId: string,
        date?: string,
        status?: string
    ): Observable<DonationResponse[]> {
        let params = new HttpParams();
        if (date) params = params.set('date', date);
        if (status) params = params.set('status', status);

        return this.http.get<DonationResponse[]>(
            `${this.DONATION_API}/blood-bank/${bloodBankId}`,
            { params }
        );
    }

    /**
     * Buscar doação por ID
     */
    getDonationById(id: string): Observable<DonationResponse> {
        return this.http.get<DonationResponse>(`${this.DONATION_API}/${id}`);
    }

    /**
     * Cancelar agendamento (usuário)
     */
    cancelDonation(
        donationId: string,
        userId: string,
        reason?: string
    ): Observable<DonationResponse> {
        const params = new HttpParams().set('userId', userId);
        const body = reason ? { reason } : {};

        return this.http.patch<DonationResponse>(
            `${this.DONATION_API}/${donationId}/cancel`,
            body,
            { params }
        );
    }

    /**
     * Confirmar agendamento (banco de sangue)
     */
    confirmDonation(donationId: string, bloodBankId: string): Observable<DonationResponse> {
        const params = new HttpParams().set('bloodBankId', bloodBankId);
        return this.http.patch<DonationResponse>(
            `${this.DONATION_API}/${donationId}/confirm`,
            null,
            { params }
        );
    }

    /**
     * Completar doação (banco de sangue)
     */
    completeDonation(
        donationId: string,
        bloodBankId: string,
        notes?: string
    ): Observable<DonationResponse> {
        const params = new HttpParams().set('bloodBankId', bloodBankId);
        const body = notes ? { reason: notes } : {};

        return this.http.patch<DonationResponse>(
            `${this.DONATION_API}/${donationId}/complete`,
            body,
            { params }
        );
    }

    /**
     * Buscar próximos agendamentos (banco de sangue)
     */
    getUpcomingDonations(bloodBankId: string, days: number = 7): Observable<DonationResponse[]> {
        const params = new HttpParams().set('days', days.toString());
        return this.http.get<DonationResponse[]>(
            `${this.DONATION_API}/blood-bank/${bloodBankId}/upcoming`,
            { params }
        );
    }

    /**
     * Buscar estatísticas de doações
     */
    getStats(bloodBankId: string, startDate: string, endDate: string): Observable<any> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);

        return this.http.get(
            `${this.DONATION_API}/blood-bank/${bloodBankId}/stats`,
            { params }
        );
    }

    /**
     * Buscar slots disponíveis considerando agendamentos
     */
    getAvailableSlots(bloodBankId: string, date: string): Observable<any> {
        return this.http.get(`${this.BLOODBANK_API}/${bloodBankId}/available-slots/${date}`);
    }
}