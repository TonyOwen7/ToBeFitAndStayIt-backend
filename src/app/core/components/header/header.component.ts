// header.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginModalComponent } from '../../../auth/login-modal/login-modal.component';
import { AuthStateService, UserProfile } from '../../../services/auth-state/auth-state.service';
import { Subscription } from 'rxjs';

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
  
  private authSubscription = new Subscription();

  constructor(
    private router: Router, 
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authSubscription.add(
      this.authState.isLoggedIn$.subscribe(status => {
        console.log('Auth status changed in header:', status);
        this.isLoggedIn = status;
      })
    );

    this.authSubscription.add(
      this.authState.userProfile$.subscribe(profile => {
        console.log('User profile changed in header:', profile);
        this.userProfile = profile;
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
    console.log('Opening login modal from header, register mode:', registerMode);
    this.isRegisterMode = registerMode;
    this.showLoginModal = true;
  }

  onLoginModalClose() {
    console.log('Login modal closed');
    this.showLoginModal = false;
    this.isRegisterMode = false;
  }

  onLoginSuccess() {
    console.log('Login successful in header');
    this.showLoginModal = false;
    this.isRegisterMode = false;
    // The AuthStateService is already updated by the login modal
    // Emit to parent component if needed for additional actions
    this.loginSuccess.emit();
  }

  // Logout method
  logout() {
    console.log('Logout clicked');
    this.authState.logout(); // This will automatically update isLoggedIn via subscription
    this.logoutClicked.emit(); // Emit to parent component for additional actions
  }

  // Navigation methods
  onRegisterClick() {
    this.router.navigate(['/register']);
  }

  onLoginClick() {
    this.openLoginModal(false); // Open modal in login mode
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
}