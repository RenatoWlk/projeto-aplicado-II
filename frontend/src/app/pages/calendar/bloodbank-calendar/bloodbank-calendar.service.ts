import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, map, Observable } from "rxjs";
import { DonationSlots, DonationResponse } from "../../donation-info/donation.model";
import { DonationInfoService } from "../../donation-info/donation-info.service";

@Injectable({
  providedIn: 'root'
})
export class BloodbankService {
  private readonly API_URL = '/api/bloodbanks';

  constructor(
    private http: HttpClient,
    private donationService: DonationInfoService
  ) {}

  /**
   * Publicar slots de disponibilidade (sistema antigo)
   */
  addAvailableSlots(slot: DonationSlots): Observable<any> {
    return this.http.post<DonationSlots>(`${this.API_URL}/publish-dates`, slot);
  }

  /**
   * NOVO: Buscar slots disponíveis combinando com agendamentos existentes
   */
  getAvailableSlotsWithBookings(bloodBankId: string, date: string): Observable<any> {
    // Busca os slots publicados e os agendamentos do dia
    return forkJoin({
      publishedSlots: this.http.get<DonationSlots>(`${this.API_URL}/${bloodBankId}/published-slots`),
      bookings: this.donationService.getBloodBankDonations(bloodBankId, date)
    }).pipe(
      map(({ publishedSlots, bookings }) => {
        // Combina os dados para mostrar disponibilidade real
        return this.mergePublishedSlotsWithBookings(publishedSlots, bookings, date);
      })
    );
  }

  /**
   * Helper: Combinar slots publicados com agendamentos
   */
  private mergePublishedSlotsWithBookings(
    publishedSlots: DonationSlots,
    bookings: DonationResponse[],
    targetDate: string
  ): any {
    const dateSlots = publishedSlots.availabilitySlots.find(
      slot => slot.date === targetDate
    );

    if (!dateSlots) return { date: targetDate, slots: [] };

    const activeBookings = bookings.filter(
      booking => booking.status !== 'CANCELLED' && booking.status !== 'NO_SHOW'
    );

    // Conta quantos agendamentos ocupam vaga por horário
    const bookingsByHour = activeBookings.reduce((acc, booking) => {
      acc[booking.hour] = (acc[booking.hour] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Atualiza os slots com os agendamentos
    const updatedSlots = dateSlots.slots.map(slot => ({
      time: slot.time,
      totalSpots: slot.availableSpots,
      bookedSpots: bookingsByHour[slot.time] || 0,
      availableSpots: slot.availableSpots - (bookingsByHour[slot.time] || 0),
      bookings: activeBookings.filter(b => b.hour === slot.time)
    }));

    return {
      date: targetDate,
      slots: updatedSlots
    };
  }
}