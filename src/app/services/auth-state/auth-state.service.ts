import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model'; // Adjust the import path as needed
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

export interface AuthData {
  token: string;
  user: UserProfile;
  timestamp: number; // For token expiry checks
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private baseUrl = environment.apiUrl;

  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'userData';
  private readonly AUTH_DATA_KEY = 'authData'; // Combined storage key
  
  // BehaviorSubjects for reactive state management
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private authInitializedSubject = new BehaviorSubject<boolean>(false);
  
  // Public observables
  public isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();
  public userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();
  public authInitialized$: Observable<boolean> = this.authInitializedSubject.asObservable();
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state - called once on service creation
   */
  private async initializeAuthState(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        this.checkAuthState();
        this.authInitializedSubject.next(true);
      }, 0);
    } else {
      // Server-side: assume not logged in
      this.setAuthState(false, null);
      this.authInitializedSubject.next(true);
      console.log('Server-side rendering - auth state set to logged out');
    }
  }

  /**
   * Check current authentication state from localStorage (browser only)
   */
  checkAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      // Try new combined storage first
      const authDataStr = localStorage.getItem(this.AUTH_DATA_KEY);
      if (authDataStr) {
        const authData: AuthData = JSON.parse(authDataStr);
        
        // Check if token is still valid (optional - add your own expiry logic)
        if (this.isTokenValid(authData)) {
          this.setAuthState(true, authData.user);
          console.log('User authenticated from combined localStorage:', authData.user);
          return;
        } else {
          // Clean up expired data
          this.clearStoredAuthData();
        }
      }

      // Fallback to old separate storage method
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);
      
      if (token && userData) {
        const user: UserProfile = JSON.parse(userData);
        // Migrate to new storage format
        this.saveAuthData(token, user);
        this.setAuthState(true, user);
        console.log('User authenticated from legacy localStorage and migrated:', user);
      } else {
        this.setAuthState(false, null);
        console.log('No authentication data found');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      this.clearStoredAuthData();
      this.setAuthState(false, null);
    }
  }

  /**
   * Check if stored token is still valid
   */
  private isTokenValid(authData: AuthData): boolean {
    // Add your token validation logic here
    // For example, check expiry time:
    // const now = Date.now();
    // const tokenAge = now - authData.timestamp;
    // const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    // return tokenAge < maxAge;
    
    // For now, just check if token exists
    return !!(authData.token && authData.user);
  }

  /**
   * Login user and save to localStorage
   */
  login(token: string, userProfile: UserProfile): void {
    // Save to storage first
    this.saveAuthData(token, userProfile);

    
    // Update reactive state
    this.setAuthState(true, userProfile);
    console.log('User logged in:', userProfile);
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(token: string, userProfile: UserProfile): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const authData: AuthData = {
        token,
        user: userProfile,
        timestamp: Date.now()
      };
      
      // Save in new combined format
      localStorage.setItem(this.AUTH_DATA_KEY, JSON.stringify(authData));
      
      // Keep legacy format for backward compatibility (optional)
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userProfile));
      
      console.log('Auth data saved to localStorage');
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  /**
   * Logout user and clear localStorage
   */
  logout(): void {
    this.clearStoredAuthData();
    
    // Update reactive state
    this.setAuthState(false, null);
    console.log('User logged out');
  }

  /**
   * Clear all stored authentication data
   */
  private clearStoredAuthData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.removeItem(this.AUTH_DATA_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      console.log('Auth data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
  if (!isPlatformBrowser(this.platformId)) {
    return null;
  }

  try {
    const authDataStr = localStorage.getItem(this.AUTH_DATA_KEY);
    if (authDataStr) {
      const authData: AuthData = JSON.parse(authDataStr);
      return authData.token;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}


  /**
   * Get current user profile
   */
  getCurrentUser(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  /**
   * Check if user is currently logged in
   */
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  /**
   * Update user profile (and save to localStorage)
   */
  updateUserProfile(userProfileUpdates: Partial<UserProfile>): void {
    if (!isPlatformBrowser(this.platformId)) return;
  
    const accessToken = this.getAuthToken(); // ✅ Use your helper method
  
    if (!accessToken) {
      console.warn('No access token found. Skipping profile update.');
      return;
    }
  
    const url = `${this.baseUrl}/user/profile/`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`
    });
  
    this.http.patch<UserProfile>(url, userProfileUpdates, { headers }).subscribe({
      next: (updatedProfile) => {
        this.saveAuthData(accessToken, updatedProfile);
        this.userProfileSubject.next(updatedProfile);
        console.log('✅ User profile successfully updated:', updatedProfile);
      },
      error: (err) => {
        console.error('❌ Failed to update user profile:', err);
      }
    });
  }
  
  

  /**
   * Private method to update both auth state and user profile
   */
  private setAuthState(isLoggedIn: boolean, userProfile: UserProfile | null): void {
    this.isLoggedInSubject.next(isLoggedIn);
    this.userProfileSubject.next(userProfile);
  }

  /**
   * Check if token exists (useful for guards)
   */
  hasValidToken(): boolean {
    const token = this.getAuthToken();
    return !!token && token.length > 0;
  }

  /**
   * Clear auth state without touching localStorage (useful for token expiry)
   */
  clearAuthState(): void {
    this.setAuthState(false, null);
    console.log('Auth state cleared (localStorage untouched)');
  }

  /**
   * Force refresh of auth state from localStorage
   */
  refreshAuthState(): void {
    this.checkAuthState();
  }

  /**
   * Get auth initialization status
   */
  isAuthInitialized(): boolean {
    return this.authInitializedSubject.value;
  }
}