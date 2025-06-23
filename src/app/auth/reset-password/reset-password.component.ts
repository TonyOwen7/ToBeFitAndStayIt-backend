import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { AuthStateService } from '../../services/auth-state/auth-state.service';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, LoginModalComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  uid: string = '';
  token: string = '';
  newPassword = '';
  confirmPassword = '';
  passwordVisible = false;
  confirmPasswordVisible = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showLoginModal = false;
  isOpen = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private authState: AuthStateService
  ) {
    this.route.params.subscribe(params => {
      this.uid = params['uid'];
      this.token = params['token'];
    });
  }
  
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  onSubmit(): void {
    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Both password fields are required';
      return;
    }
  
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
  
    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
  
    this.authService.resetPassword(this.uid, this.token, this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
  
        const userProfile = {
          username: res.user?.username || '',
          email: res.user?.email || '',
        };
  
        localStorage.setItem('accessToken', res.access);
        localStorage.setItem('refreshToken', res.refresh);
  
        this.authState.login(res.access, userProfile);
  
        this.successMessage = 'Password reset successful! Redirecting to home page...';
        setTimeout(() => this.router.navigate(['/home']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || '';
        if (msg.includes('expired') || msg.includes('invalid')) {
          this.errorMessage = 'Reset link is invalid or has expired.';
        } else if (msg.includes('same as the old')) {
          this.errorMessage = 'New password cannot be the same as the previous one.';
        } else {
          this.errorMessage = 'Password reset failed. Please try again.';
        }
      }
    });
  }

  openLoginModal(): void {
    console.log('Opening login modal from register');
    this.showLoginModal = true;
  }

  onLoginModalClose(): void {
    console.log('Login modal closed');
    this.showLoginModal = false;
  }

  onLoginModalSuccess(): void {
    console.log('Login successful from modal');
    this.showLoginModal = false;
    this.router.navigate(['/home']);
  }
}
