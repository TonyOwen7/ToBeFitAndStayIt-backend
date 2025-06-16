import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TipCategory {
  name: string;
  tip_count: number;
  tip_percentage: number;
}

export interface AppInterestSummary {
  choice: string;
  count: number;
}

export interface DashboardResponse {
  categories: TipCategory[];
  total_tips: number;
  interest_summary: AppInterestSummary[];
  total_votes: number;
}

@Injectable({
  providedIn: 'root'
})

export class AppInterestService {

  apiUrl  = 'http://localhost:8000/api/app-interest/';

  constructor(private http: HttpClient) {}

  submitInterest(choice: 'yes' | 'maybe' | 'no'): Observable<any> {
    return this.http.post(this.apiUrl , { choice });
  }
  
}
