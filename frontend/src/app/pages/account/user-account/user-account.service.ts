import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Achievement, Address } from '../../dashboard/dashboard.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  gender: string;
  bloodType: string;
  address?: Address;
  achievements?: Achievement[];
  photoUrl: string | null;
  lastDonation: string;
  nextEligibleDonation: string;
}

export interface EligibilityQuestionnaireDTO {
  userId: string;
  gender: string;
  age: boolean;
  donationBefore60: boolean;
  weight: boolean;
  healthy: boolean;
  pregnant?: boolean;
  recentChildbirth?: boolean;
  symptoms: boolean;
  diseases: boolean;
  medications: boolean;
  procedures: boolean;
  drugs: boolean;
  partners: boolean;
  tattooOrPiercing: boolean;
  lastDonationMale?: boolean;
  lastDonationFemale?: boolean;
  covidVaccine: boolean;
  yellowFeverVaccine: boolean;
  travelRiskArea: boolean;
  eligible: boolean;
  resultMessage: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserAccountService {
  private readonly API = '/api/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUser(): Observable<User> {
    const id = this.authService.getCurrentUserId();
    return this.http.get<User>(`${this.API}/${id}`);
  }

  updateUser(user: Partial<User>): Observable<User> {
    const id = this.authService.getCurrentUserId();
    return this.http.put<User>(`${this.API}/${id}`, user);
  }

  getQuestionnairesByUser(): Observable<EligibilityQuestionnaireDTO[]> {
    const userId = this.authService.getCurrentUserId();
    return this.http.get<EligibilityQuestionnaireDTO[]>(`/api/questionnaire/${userId}`);
  }

  // TODO
  changePassword(userId: string, password: string): Observable<any> {
    return new Observable<any>;
  }

  // TODO
  uploadPhoto(file: File): Observable<any> {
    return new Observable<any>;
  }
}
