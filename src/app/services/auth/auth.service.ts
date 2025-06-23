import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  logout(): Observable<any> {
    let refreshToken: string | null = null;
    if (isPlatformBrowser(this.platformId)) {
      refreshToken = localStorage.getItem('refreshToken'); // or 'accessToken' if that's what you're using
    }

    console.log('Logging out with refresh token:', refreshToken);

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