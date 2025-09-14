import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BloodType } from '../../../shared/app.enums';
import { HttpClient } from '@angular/common/http';

export interface TopDonor {
    name: string;
    totalDonations: number;
    bloodtype: BloodType;
}

export interface TopPointsUser {
    name: string;
    points: number;
    bloodtype: BloodType;
}

export interface Leaderboards {
    topDonors: TopDonor[];
    topPointsUsers: TopPointsUser[];
}

@Injectable({
    providedIn: 'root'
})
export class LeaderboardsService {
    constructor(private http: HttpClient) {}

    getLeaderboards(): Observable<Leaderboards> {
        return this.http.get<Leaderboards>(`/api/dashboard/leaderboards`);
    }
}
