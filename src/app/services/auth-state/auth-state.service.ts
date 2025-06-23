import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http'

export interface AuthData {
  token: string;
  user: UserProfile;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private baseUrl = environment.apiUrl;

  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'userData';
  private readonly AUTH_DATA_KEY = 'authData';
  private authToken: string | null = null; // Store token in memory for quick access
  
  // Initialize with null to distinguish from "checked and not logged in"
  // IMPORTANT: Don't set initial values during SSR
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private authInitializedSubject = new BehaviorSubject<boolean>(false);
  private hasCheckedAuth = false; // Track if we've actually checked auth state
  
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
   * Initialize authentication state - only check on browser
   */
  async initializeAuthState(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      // Wait for next tick to ensure Angular is fully initialized
      setTimeout(() => {
        console.log('🔍 Checking auth state on browser...');
        this.checkAuthState();
        this.hasCheckedAuth = true;
        this.authInitializedSubject.next(true);
      }, 100);
    } else {
      // Server-side: Just mark as initialized, don't set any auth state
      console.log('🖥️ Server-side rendering - marking as initialized without auth check');
      // Don't call setAuthState here - let client-side handle it
      this.authInitializedSubject.next(true);
    }
  }

  /**
   * Check current authentication state from localStorage (browser only)
   */
  checkAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('❌ Not browser - skipping auth state check');
      return;
    }

    try {
      console.log('🔑 Checking localStorage for auth data...');
      
      // Try new combined storage first
      const authDataStr = localStorage.getItem(this.AUTH_DATA_KEY);
      if (authDataStr) {
        const authData: AuthData = JSON.parse(authDataStr);
        console.log('✅ Found combined auth data:', authData);
        
        if (this.isTokenValid(authData)) {
          console.log('✅ Token is valid, setting logged in state');
          this.setAuthState(true, authData.user);
          return;
        } else {
          console.log('❌ Token expired, clearing data');
          this.clearStoredAuthData();
        }
      }

      // Fallback to old separate storage method
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);
      
      if (token && userData) {
        console.log('✅ Found legacy auth data, migrating...');
        const user: UserProfile = JSON.parse(userData);
        this.saveAuthData(token, user);
        this.setAuthState(true, user);
        console.log('✅ Migration complete, user authenticated:', user);
      } else {
        console.log('❌ No authentication data found, setting logged out');
        this.setAuthState(false, null);
      }
    } catch (error) {
      console.error('❌ Error checking auth state:', error);
      this.clearStoredAuthData();
      this.setAuthState(false, null);
    }
  }

  /**
   * Check if stored token is still valid
   */
  private isTokenValid(authData: AuthData): boolean {
    if (!authData.token || !authData.user) {
      return false;
    }
    
    // Optional: Add time-based validation
    const now = Date.now();
    const tokenAge = now - authData.timestamp;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (tokenAge > maxAge) {
      console.log('⏰ Token expired due to age');
      return false;
    }
    
    return true;
  }

  /**
   * Login user and save to localStorage
   */
  login(token: string, userProfile: UserProfile): void {
    console.log('🔐 Logging in user:', userProfile);
    
    // Save to storage first
    this.saveAuthData(token, userProfile);
    
    // Force update auth state (bypass SSR check since this is an active login)
    this.forceSetAuthState(true, userProfile);
    
    console.log('✅ User logged in successfully');
  }

  /**
   * Force set auth state (used during login/logout to bypass SSR checks)
   */
  private forceSetAuthState(isLoggedIn: boolean, userProfile: UserProfile | null): void {
    console.log(`🔄 Force setting auth state - isLoggedIn: ${isLoggedIn}, user:`, userProfile);
    this.isLoggedInSubject.next(isLoggedIn);
    this.userProfileSubject.next(userProfile);
    console.log('📡 Auth state force broadcasted to subscribers');
  }

  /**
   * Save authentication data to localStorage
   */
  private saveAuthData(token: string, userProfile: UserProfile): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('❌ Not browser - skipping auth data save');
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
      
      // Keep legacy format for backward compatibility
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userProfile));
      
      console.log('💾 Auth data saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving auth data:', error);
    }

    this.authToken = token;

  }

  /**
   * Logout user and clear localStorage
   */
  logout(): void {
    console.log('👋 Logging out user...');
    this.clearStoredAuthData();
    this.forceSetAuthState(false, null);
    console.log('✅ User logged out successfully');
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
      console.log('🗑️ Auth data cleared from localStorage');
    } catch (error) {
      console.error('❌ Error clearing auth data:', error);
    }
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
    if (this.authToken) return this.authToken;
  
    if (!isPlatformBrowser(this.platformId)) return null;
  
    try {
      const authDataStr = localStorage.getItem(this.AUTH_DATA_KEY);
      if (authDataStr) {
        const authData: AuthData = JSON.parse(authDataStr);
        this.authToken = authData.token;
        return this.authToken;
      }
      const legacyToken = localStorage.getItem(this.TOKEN_KEY);
      this.authToken = legacyToken;
      return legacyToken;
    } catch (error) {
      console.error('❌ Error retrieving auth token:', error);
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
  
    const accessToken = this.getAuthToken();
  
    if (!accessToken) {
      console.warn('❌ No access token found. Skipping profile update.');
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
   * This is the key method that triggers the reactive updates
   */
  private setAuthState(isLoggedIn: boolean, userProfile: UserProfile | null): void {
    // Only set auth state during SSR if we're forcing it (like during login)
    // Otherwise, wait for client-side check
    if (!isPlatformBrowser(this.platformId) && !this.hasCheckedAuth) {
      console.log('⏸️ Skipping auth state update - SSR without client check');
      return;
    }

    console.log(`🔄 Setting auth state - isLoggedIn: ${isLoggedIn}, user:`, userProfile);
    
    // Force emit even if value hasn't changed to ensure components update
    this.isLoggedInSubject.next(isLoggedIn);
    this.userProfileSubject.next(userProfile);
    
    console.log('📡 Auth state broadcasted to subscribers');
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
    console.log('🔄 Auth state cleared (localStorage untouched)');
  }

  /**
   * Force refresh of auth state from localStorage
   */
  refreshAuthState(): void {
    console.log('🔄 Refreshing auth state...');
    this.checkAuthState();
  }

  /**
   * Get auth initialization status
   */
  isAuthInitialized(): boolean {
    return this.authInitializedSubject.value;
  }
}