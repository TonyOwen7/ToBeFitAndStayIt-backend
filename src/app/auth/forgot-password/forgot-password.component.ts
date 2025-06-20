// forgot-password.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent, LoginModalComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  emailError = '';
  successMessage = '';
  isLoading = false;
  showLoginModal = false;
  isOpen = false;
  isFalse = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    public router: Router
  ) {}

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
    this.router.navigate(['/dashboard']);
  }


  onEmailChange() {
    this.successMessage = '';
    if (!this.email) {
      this.emailError = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  submitRequest() {
    this.onEmailChange();
    if (this.emailError) return;
  
    this.isLoading = true;
  
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = "If your email is registered, you'll receive a password reset link shortly.";
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.emailError = 'Email not found in our system';
        } else {
          this.emailError = 'An error occurred. Please try again later.';
        }
      }
    });
  }
  
}