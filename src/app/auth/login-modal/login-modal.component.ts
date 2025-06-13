import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Input() isOpen = false;
  @Input() bottomValue: number | string = "auto";
  @Output() isclosed = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  constructor(private authService: AuthService, private router: Router) {}

  email = '';
  password = '';
  rememberMe = false;
  passwordVisible = false;
  isLoading = false;
  emailError = '';
  passwordError = '';
  loginError = '';

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  onSubmit() {
    this.emailError = '';
    this.passwordError = '';
    this.loginError = '';
    let isValid = true;

    if (!this.email) {
      this.emailError = 'Email is required';
      isValid = false;
    } else if (!this.validateEmail(this.email)) {
      this.emailError = 'Please enter a valid email';
      isValid = false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      isValid = false;
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!isValid) return;

    this.isLoading = true;
    
    console.log('Attempting login with:', { email: this.email });

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        console.log('Login successful:', res);
        
        // Store tokens
        if (res.access) {
          localStorage.setItem('accessToken', res.access);
        }
        if (res.refresh) {
          localStorage.setItem('refreshToken', res.refresh);
        }
        
        // Store user info
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }

        this.isLoading = false;
        this.loginSuccess.emit();
        this.close();
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.isLoading = false;
        
        // Handle different types of errors
        if (err.error) {
          if (err.error.non_field_errors && Array.isArray(err.error.non_field_errors)) {
            this.loginError = err.error.non_field_errors[0];
          } else if (typeof err.error === 'string') {
            this.loginError = err.error;
          } else {
            this.loginError = 'Login failed. Please check your credentials.';
          }
        } else {
          this.loginError = 'Login failed. Please check your connection.';
        }
      }
    });
  }

  socialLogin(provider: string) {
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login would be implemented here.`);
  }

  switchToRegister() {
    this.router.navigate(['/register']);
    this.close();
  }

  closeModal(event: Event) {
    if ((event.target as Element).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  close() {
    this.isOpen = false;
    this.isclosed.emit();
    this.resetForm();
  }

  resetForm() {
    this.email = '';
    this.password = '';
    this.rememberMe = false;
    this.passwordVisible = false;
    this.emailError = '';
    this.passwordError = '';
    this.loginError = '';
  }
}