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
  age: string;
  donationBefore60: string;
  weight: string;
  healthy: string;
  pregnant?: string;
  recentChildbirth?: string;
  symptoms: string;
  diseases: string;
  medications: string;
  procedures: string;
  drugs: string;
  partner: string;
  tattooOrPiercing: string;
  lastDonationMale?: string;
  lastDonationFemale?: string;
  covidVaccine: string;
  yellowFeverVaccine: string;
  travelRiskArea: string;
  isEligible: boolean;
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


  changePassword(userId: string, password: string): Observable<any> {
    return new Observable<any>;
  }

  uploadPhoto(file: File): Observable<any> {
    return new Observable<any>;
  }
}
