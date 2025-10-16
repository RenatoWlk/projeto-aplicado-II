import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';

export interface QuestionnaireData {
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
}

@Injectable({
  providedIn: 'root',
})
export class QuestionnaireService {
  private apiUrl = '/api/questionnaire';

  constructor(private http: HttpClient,private authService: AuthService) {}

  submitQuestionnaire(data: QuestionnaireData): Observable<any> {
    const id = this.authService.getCurrentUserId();
    data.userId = id;
    return this.http.post(`${this.apiUrl}`, data);
  }

  getUserQuestionnaires(): Observable<any[]> {
    const id = this.authService.getCurrentUserId();
    return this.http.get<any[]>(`${this.apiUrl}/${id}`);
  }
}
