// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api'; // Update if different

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
