// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
  message?: string;
}

interface RegisterResponse {
  message: string;
  access: string;
  refresh: string;
  user: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
  };
}

type AuthResponse = LoginResponse | RegisterResponse;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login/`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/reset-password-request/`, { email });
  }

  resetPassword(uid: string, token: string, newPassword: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/reset-password/`, {
      uid, token, new_password: newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  

  register(data: any): Observable<AuthResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/`, data).pipe(
      catchError(this.handleError)
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  logout(refreshToken: string | null): Observable<any> {
    // If no refresh token exists, skip backend logout
    if (!refreshToken) {
      return of({ message: 'No refresh token found' });
    }

    // Send logout request to invalidate refresh token
    return this.http.post(
      `${this.apiUrl}/logout/`,
      { refresh: refreshToken }
    ).pipe(
      catchError(this.handleError)
    );
  }

  registerAndLogin(data: any): Observable<AuthResponse> {
    return this.register(data).pipe(
      switchMap((registerResponse) => {
        return this.login({
          email: data.email,
          password: data.password
        });
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}