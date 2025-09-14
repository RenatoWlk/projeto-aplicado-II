import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  private apiUrlPartner = `/api/partners/create`;
  private apiUrlDonator = `/api/users/create`;
  private apiUrlBloodBank = `/api/bloodbanks/create`;

  constructor(private http: HttpClient) {}

  registerPartner(payload: any): Observable<any> {
    return this.http.post(this.apiUrlPartner, payload);
  }

  registerBloodBank(payload: any): Observable<any> {
    return this.http.post(this.apiUrlBloodBank, payload);
  }

  registerDonator(payload: any): Observable<any> {
    return this.http.post(this.apiUrlDonator, payload);
  }
}
