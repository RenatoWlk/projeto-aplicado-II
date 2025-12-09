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
   * Creates a new donation scheduling.
   *
   * @param request The donation creation payload.
   * @returns Observable with the created donation data.
   */
  createDonation(request: CreateDonationRequest): Observable<DonationResponse> {
    return this.http.post<DonationResponse>(this.API_URL, request);
  }

  /**
   * Retrieves donation records for a given user.
   *
   * @param userId The ID of the user.
   * @param activeOnly If true, only active donations will be returned.
   * @returns Observable with a list of donation responses.
   */
  getUserDonations(userId: string, activeOnly: boolean = false): Observable<DonationResponse[]> {
    const params = new HttpParams().set('activeOnly', activeOnly.toString());
    return this.http.get<DonationResponse[]>(`${this.API_URL}/user/${userId}`, { params });
  }

  /**
   * Retrieves donation records for a blood bank, optionally filtered by date and status.
   *
   * @param bloodBankId The ID of the blood bank.
   * @param date Optional filter for a specific date (YYYY-MM-DD).
   * @param status Optional filter for donation status.
   * @returns Observable with a list of donation responses.
   */
  getBloodBankDonations(bloodBankId: string, date?: string, status?: string): Observable<DonationResponse[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    if (status) params = params.set('status', status);

    return this.http.get<DonationResponse[]>(`${this.API_URL}/blood-bank/${bloodBankId}`, { params });
  }

  /**
   * Checks the availability of a specific time slot.
   *
   * @param bloodBankId The ID of the blood bank.
   * @param date The date to check (YYYY-MM-DD).
   * @param hour The hour to check (HH:mm).
   * @returns Observable containing slot availability information.
   */
  checkSlotAvailability(bloodBankId: string, date: string, hour: string): Observable<SlotAvailability> {
    const params = new HttpParams()
      .set('bloodBankId', bloodBankId)
      .set('date', date)
      .set('hour', hour);

    return this.http.get<SlotAvailability>(`${this.API_URL}/availability`, { params });
  }

  /**
   * Retrieves a donation record by ID.
   *
   * @param id The donation ID.
   * @returns Observable containing the donation details.
   */
  getDonationById(id: string): Observable<DonationResponse> {
    return this.http.get<DonationResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * Cancels a donation (user action).
   *
   * @param donationId The ID of the donation to cancel.
   * @param userId The ID of the user performing the cancellation.
   * @param reason Optional cancellation reason.
   * @returns Observable with the updated donation data.
   */
  cancelDonation(donationId: string, userId: string, reason?: string): Observable<DonationResponse> {
    const params = new HttpParams().set('userId', userId);
    const body: CancelDonationRequest = reason ? { reason } : {};

    return this.http.patch<DonationResponse>(`${this.API_URL}/${donationId}/cancel`, body, { params });
  }

  /**
   * Confirms a donation (blood bank action).
   *
   * @param donationId The ID of the donation to confirm.
   * @param bloodBankId The ID of the blood bank confirming the donation.
   * @returns Observable with the updated donation data.
   */
  confirmDonation(donationId: string, bloodBankId: string): Observable<DonationResponse> {
    const params = new HttpParams().set('bloodBankId', bloodBankId);
    return this.http.patch<DonationResponse>(`${this.API_URL}/${donationId}/confirm`, null, { params });
  }

  /**
   * Completes a donation (blood bank action).
   *
   * @param donationId The ID of the donation to complete.
   * @param bloodBankId The ID of the blood bank completing the donation.
   * @param notes Optional notes to be stored with the completion record.
   * @returns Observable with the updated donation data.
   */
  completeDonation(donationId: string, bloodBankId: string, notes?: string): Observable<DonationResponse> {
    const params = new HttpParams().set('bloodBankId', bloodBankId);
    const body: CancelDonationRequest | null = notes ? { reason: notes } : null

    return this.http.patch<DonationResponse>(`${this.API_URL}/${donationId}/complete`, body, { params });
  }

  /**
   * Retrieves upcoming scheduled donations for a blood bank.
   *
   * @param bloodBankId The ID of the blood bank.
   * @param days Number of days ahead to search. Defaults to 7.
   * @returns Observable with a list of upcoming donation records.
   */
  getUpcomingDonations(bloodBankId: string, days: number = 7): Observable<DonationResponse[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<DonationResponse[]>(`${this.API_URL}/blood-bank/${bloodBankId}/upcoming`, { params });
  }

  /**
   * Retrieves statistical data regarding donations from a blood bank.
   *
   * @param bloodBankId The ID of the blood bank.
   * @returns Observable containing donation statistics.
   */
  getStats(bloodBankId: string): Observable<DonationStats> {
    return this.http.get<DonationStats>(`${this.API_URL}/blood-bank/${bloodBankId}/stats`);
  }
}