// src/app/services/settings/settings.service.ts
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  age: number | null;
  gender: string;
  weight: number | null;
  height: number | null;
  activity_level: string;
  health_goal: string;
  wants_newsletter: boolean;
  date_joined: string;
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
}

export interface UserUpdateData {
  email?: string;
  first_name?: string;
  last_name?: string;
  age?: number | null;
  gender?: string;
  weight?: number | null;
  height?: number | null;
  activity_level?: string;
  health_goal?: string;
  wants_newsletter?: boolean;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'http://127.0.0.1:8000/api/settings';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getHeaders(): HttpHeaders {
    if (!isPlatformBrowser(this.platformId)) {
      throw new Error('localStorage is not available in this environment.');
    }

    const authToken = localStorage.getItem('auth_token');
    if (!authToken) throw new Error('Missing authentication token');
    return new HttpHeaders({ Authorization: `Bearer ${authToken}` });
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile/`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateUserProfile(data: UserUpdateData): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/update/`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  changePassword(data: PasswordChangeData): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/change-password/`, data, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
  
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  exportUserData(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/`, { headers: this.getHeaders(), responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'An error occurred';

    if (error.status === 0) message = 'Unable to connect to the server.';
    else if (error.status === 401) message = 'Unauthorized. Please log in again.';
    else if (error.status === 403) message = 'Permission denied.';
    else if (error.status === 404) message = 'Resource not found.';
    else if (error.status >= 500) message = 'Server error. Try later.';
    else if (error.error && typeof error.error === 'object') {
      const key = Object.keys(error.error)[0];
      if (key && Array.isArray(error.error[key])) message = error.error[key][0];
    }

    console.error('HTTP Error:', error);
    return throwError(() => ({ ...error, message }));
  }
}
