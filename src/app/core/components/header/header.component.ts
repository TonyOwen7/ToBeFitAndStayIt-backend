// header.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginModalComponent } from '../../../auth/login-modal/login-modal.component';
import { UserProfile } from '../../../models/user-profile.model';
import { AuthStateService } from '../../../services/auth-state/auth-state.service';
import { Subscription, combineLatest } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, LoginModalComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  // Visual customization inputs
  @Input() title: string = "ToBeFitAndStayIt";
  @Input() subtitle: string = "Your Complete Wellness Journey";
  @Input() background: string = "linear-gradient(135deg, #ffd700 0%, #ffb347 30%, #ffa500 70%, #ff8f00 100%)";
  @Input() radiant: string = "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)";
  @Input() border_auth_btn: string = "2px solid rgba(255, 215, 0, 0.6)";
  @Input() bottomValue: string | number = "auto";
  
  // Events
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  // Component state
  isLoggedIn = false;
  userProfile: UserProfile | null = null;
  showLoginModal = false;
  isMobileNavOpen = false;
  isRegisterMode = false;
  authInitialized = false;
  
  private authSubscription = new Subscription();

  constructor(
    private router: Router, 
    private authState: AuthStateService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    console.log('🚀 Header component initializing...');
    
    // Wait for auth to be initialized before subscribing to state changes
    this.authSubscription.add(
      this.authState.authInitialized$
        .pipe(filter(initialized => initialized))
        .subscribe(() => {
          console.log('✅ Auth initialized, setting up subscriptions');
          this.authInitialized = true;
          this.setupAuthSubscriptions();
        })
    );
  }

  private setupAuthSubscriptions(): void {
    // Only set up subscriptions if we're in the browser
    if (!isPlatformBrowser(this.platformId)) {
      console.log('🖥️ Server-side rendering - skipping auth subscriptions');
      return;
    }

    console.log('🔧 Setting up auth subscriptions in browser...');

    // Subscribe to authentication state changes
    this.authSubscription.add(
      this.authState.isLoggedIn$
        .pipe(distinctUntilChanged())
        .subscribe(status => {
          console.log('🔄 Auth status changed in header:', status);
          this.isLoggedIn = status;
        })
    );

    this.authSubscription.add(
      this.authState.userProfile$
        .pipe(
          distinctUntilChanged((a, b) => {
            // Deep comparison for user profiles
            return JSON.stringify(a) === JSON.stringify(b);
          })
        )
        .subscribe(profile => {
          console.log('👤 User profile changed in header:', profile);
          this.userProfile = profile;
        })
    );

    // Alternative: Use combineLatest for better synchronization
    this.authSubscription.add(
      combineLatest([
        this.authState.isLoggedIn$,
        this.authState.userProfile$
      ]).subscribe(([isLoggedIn, userProfile]) => {
        console.log('🔄 Combined auth state update:', { isLoggedIn, userProfile });
        this.isLoggedIn = isLoggedIn;
        this.userProfile = userProfile;
      })
    );
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  closeMobileNav(): void {
    this.isMobileNavOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navToggle = document.querySelector('.nav-toggle');
    const headerNav = document.querySelector('.header-navigation');
    
    if (this.isMobileNavOpen &&
        !navToggle?.contains(target) &&
        !headerNav?.contains(target)) {
      this.closeMobileNav();
    }
  }

  // Login modal methods
  openLoginModal(registerMode = false) {
    console.log('🔐 Opening login modal from header, register mode:', registerMode);
    this.isRegisterMode = registerMode;
    this.showLoginModal = true;
  }

  onLoginModalClose() {
    console.log('❌ Login modal closed');
    this.showLoginModal = false;
    this.isRegisterMode = false;
  }

  onLoginSuccess() {
    console.log('✅ Login successful in header');
    this.showLoginModal = false;
    this.isRegisterMode = false;
    this.loginSuccess.emit();
  }

  logout() {
    console.log('👋 Logout clicked');
  
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Server logout successful');
        this.authState.logout();
        this.logoutClicked.emit();
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('❌ Server logout failed:', err);
        // Force logout on client even if server fails
        this.authState.logout();
        if (isPlatformBrowser(this.platformId)) {
          localStorage.clear();
        }
        this.logoutClicked.emit();
        this.router.navigate(['/']);
      }
    });
  }

  // Navigation methods
  onRegisterClick() {
    this.router.navigate(['/auth/register']);
  }

  onLoginClick() {
    this.openLoginModal(false);
  }

  // Helper methods for template
  getUserDisplayName(): string {
    if (!this.userProfile) return 'User';
    return this.userProfile.firstName || this.userProfile.username || 'User';
  }

  getUserInitials(): string {
    if (!this.userProfile) return 'U';
    const firstName = this.userProfile.firstName?.[0] || '';
    const lastName = this.userProfile.lastName?.[0] || '';
    const username = this.userProfile.username?.[0] || '';
    return (firstName + lastName) || username || 'U';
  }

  // Debug method to manually refresh auth state
  refreshAuth(): void {
    console.log('🔄 Manually refreshing auth state...');
    this.authState.refreshAuthState();
  }
}