import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Address } from '../../dashboard/dashboard.service';

export interface Offer {
  title: string;
  body: string;
  validUntil: Date | null;
  discountPercentage: number;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  address?: Address;
  offers?: Offer[];
  photoUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerAccountService {
  private readonly API = '/api/partners';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getPartner(): Observable<Partner> {
    const id = this.authService.getCurrentUserId();
    return this.http.get<Partner>(`${this.API}/${id}`);
  }

  updatePartner(partner: Partial<Partner>): Observable<Partner> {
    const id = this.authService.getCurrentUserId();
    return this.http.put<Partner>(`${this.API}/${id}`, partner);
  }

  changePassword(userId: string, password: string): Observable<any> {
    return new Observable<any>;
  }

  uploadPhoto(file: File): Observable<any> {
    return new Observable<any>;
  }

  addOffer(offer: Offer): Observable<any> {
    return new Observable<any>;
  }

  updateOffer(index:number, offer: Offer): Observable<any> {
    return new Observable<any>;
  }

  removeOffer(offer: Offer): Observable<any> {
    return new Observable<any>;
  }
}
