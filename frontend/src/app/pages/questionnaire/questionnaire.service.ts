import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth/auth.service';

export interface QuestionnaireData {
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
  partners: string;
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
  providedIn: 'root',
})
export class QuestionnaireService {
  private apiUrl = '/api/questionnaire'; // ajuste conforme necessário

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
