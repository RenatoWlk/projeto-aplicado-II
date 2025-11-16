import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CancelDonationRequest, CreateDonationRequest, DonationResponse, DonationStats, SlotAvailability } from './donation.model';

@Injectable({
  providedIn: 'root'
})
export class DonationInfoService {
  private readonly API_URL = '/api/donations';

  constructor(private http: HttpClient) {}

  /**
   * Criar um novo agendamento de doação
   */
  createDonation(request: CreateDonationRequest): Observable<DonationResponse> {
    return this.http.post<DonationResponse>(this.API_URL, request);
  }

  /**
   * Buscar agendamentos de um usuário
   */
  getUserDonations(userId: string, activeOnly: boolean = false): Observable<DonationResponse[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<DonationResponse[]>(`${this.API_URL}/user/${userId}`, { params });
  }

  /**
   * Buscar agendamentos de um banco de sangue
   */
  getBloodBankDonations( bloodBankId: string, date?: string, status?: string): Observable<DonationResponse[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (status) params = params.set('status', status);

    return this.http.get<DonationResponse[]>(
      `${this.API_URL}/blood-bank/${bloodBankId}`,
      { params }
    );
  }

  /**
   * Verificar disponibilidade de um horário específico
   */
  checkSlotAvailability(
    bloodBankId: string,
    date: string,
    hour: string
  ): Observable<SlotAvailability> {
    const params = new HttpParams()
      .set('bloodBankId', bloodBankId)
      .set('date', date)
      .set('hour', hour);

    return this.http.get<SlotAvailability>(`${this.API_URL}/availability`, { params });
  }

  /**
   * Buscar doação por ID
   */
  getDonationById(id: string): Observable<DonationResponse> {
    return this.http.get<DonationResponse>(`${this.API_URL}/${id}`);
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
    const body: CancelDonationRequest = reason ? { reason } : {};

    return this.http.patch<DonationResponse>(
      `${this.API_URL}/${donationId}/cancel`,
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
      `${this.API_URL}/${donationId}/confirm`,
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
    const body: CancelDonationRequest = notes ? { reason: notes } : {};

    return this.http.patch<DonationResponse>(
      `${this.API_URL}/${donationId}/complete`,
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
      `${this.API_URL}/blood-bank/${bloodBankId}/upcoming`,
      { params }
    );
  }

  /**
   * Buscar estatísticas de doações
   */
  getStats(bloodBankId: string, startDate: string, endDate: string): Observable<DonationStats> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<DonationStats>(
      `${this.API_URL}/blood-bank/${bloodBankId}/stats`,
      { params }
    );
  }
}