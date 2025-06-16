// login-modal.component.ts
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStateService } from '../../services/auth-state/auth-state.service';

@Component({
  selector: 'app-login-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Input() isOpen = false;
  @Input() bottomValue: number | string = "auto";
  @Input() isRegisterMode = false;
  @Output() isclosed = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  constructor(private authService: AuthService, private authState: AuthStateService, private router: Router) {}

  // Form fields
  email = '';
  password = '';
  confirmPassword = '';
  rememberMe = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  isLoading = false;

  // Error messages
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';
  loginError = '';

  // Validation patterns
  private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  validateEmail(email: string): { isValid: boolean; message: string } {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }
    if (!this.emailPattern.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address (e.g., user@example.com)' };
    }
    return { isValid: true, message: '' };
  }

  validatePassword(password: string): { isValid: boolean; message: string } {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (this.isRegisterMode) {
      if (!this.passwordPattern.test(password)) {
        return { 
          isValid: false, 
          message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' 
        };
      }
    }
    return { isValid: true, message: '' };
  }

  validateConfirmPassword(password: string, confirmPassword: string): { isValid: boolean; message: string } {
    if (this.isRegisterMode) {
      if (!confirmPassword) {
        return { isValid: false, message: 'Please confirm your password' };
      }
      if (password !== confirmPassword) {
        return { isValid: false, message: 'Passwords do not match' };
      }
    }
    return { isValid: true, message: '' };
  }

  onEmailChange() {
    if (this.email) {
      const validation = this.validateEmail(this.email);
      this.emailError = validation.message;
    } else {
      this.emailError = '';
    }
  }

  onPasswordChange() {
    if (this.password) {
      const validation = this.validatePassword(this.password);
      this.passwordError = validation.message;
      
      if (this.confirmPassword) {
        this.onConfirmPasswordChange();
      }
    } else {
      this.passwordError = '';
    }
  }

  onConfirmPasswordChange() {
    if (this.confirmPassword || this.password) {
      const validation = this.validateConfirmPassword(this.password, this.confirmPassword);
      this.confirmPasswordError = validation.message;
    } else {
      this.confirmPasswordError = '';
    }
  }

  onSubmit() {
    // Clear previous errors
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.loginError = '';

    let isValid = true;

    // Validate email
    const emailValidation = this.validateEmail(this.email);
    if (!emailValidation.isValid) {
      this.emailError = emailValidation.message;
      isValid = false;
    }

    // Validate password
    const passwordValidation = this.validatePassword(this.password);
    if (!passwordValidation.isValid) {
      this.passwordError = passwordValidation.message;
      isValid = false;
    }

    // Validate confirm password (only in register mode)
    if (this.isRegisterMode) {
      const confirmPasswordValidation = this.validateConfirmPassword(this.password, this.confirmPassword);
      if (!confirmPasswordValidation.isValid) {
        this.confirmPasswordError = confirmPasswordValidation.message;
        isValid = false;
      }
    }

    if (!isValid) return;

    this.isLoading = true;
    console.log('Attempting login with:', { email: this.email });

    // Choose the appropriate service method based on mode
    const authCall = this.isRegisterMode 
      ? this.authService.register({ 
          email: this.email, 
          password: this.password, 
          confirm_password: this.confirmPassword,
          username: this.email.split('@')[0], // Generate username from email
          first_name: '',
          last_name: ''
        })
      : this.authService.login({ email: this.email, password: this.password });

    authCall.subscribe({
      next: (res) => {
        console.log(`${this.isRegisterMode ? 'Registration' : 'Login'} successful:`, res);
        
        this.isLoading = false;
        
        // THIS IS THE KEY FIX: Update the AuthStateService with the login data
        if (res && res.token) {
          // Create user profile from response
          const userProfile = {
            id: res.user?.id || res.id,
            username: res.user?.username || res.username || this.email.split('@')[0],
            email: res.user?.email || res.email || this.email,
            firstName: res.user?.first_name || res.first_name || '',
            lastName: res.user?.last_name || res.last_name || '',
            avatar: res.user?.avatar || res.avatar
          };
          
          // Update AuthStateService with token and user profile
          this.authState.login(res.token, userProfile);
          console.log('AuthStateService updated with login data');
        } else {
          console.warn('Login response missing token or user data:', res);
          // If no token in response, still try to update auth state
          const userProfile = {
            username: this.email.split('@')[0],
            email: this.email
          };
          this.authState.login('dummy-token', userProfile);
        }
        
        // Emit success event to parent component
        this.loginSuccess.emit();
        
        // Close modal
        this.close();
      },
      error: (err) => {
        console.error(`${this.isRegisterMode ? 'Registration' : 'Login'} failed:`, err);
        this.isLoading = false;
        
        // Handle different types of errors
        if (err.error) {
          if (err.error.non_field_errors && Array.isArray(err.error.non_field_errors)) {
            this.loginError = err.error.non_field_errors[0];
          } else if (err.error.email && Array.isArray(err.error.email)) {
            this.emailError = err.error.email[0];
          } else if (err.error.password && Array.isArray(err.error.password)) {
            this.passwordError = err.error.password[0];
          } else if (typeof err.error === 'string') {
            this.loginError = err.error;
          } else if (err.status === 400) {
            this.loginError = 'Invalid credentials. Please check your email and password.';
          } else if (err.status === 429) {
            this.loginError = 'Too many attempts. Please try again later.';
          } else {
            this.loginError = `${this.isRegisterMode ? 'Registration' : 'Login'} failed. Please check your credentials.`;
          }
        } else if (err.status === 0) {
          this.loginError = 'Network error. Please check your internet connection.';
        } else {
          this.loginError = `${this.isRegisterMode ? 'Registration' : 'Login'} failed. Please try again.`;
        }
      }
    });
  }

  socialLogin(provider: string) {
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login would be implemented here.`);
  }

  switchToRegister() {
    this.isRegisterMode = true;
    this.resetForm();
  }

  switchToLogin() {
    this.isRegisterMode = false;
    this.resetForm();
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
    this.confirmPassword = '';
    this.rememberMe = false;
    this.passwordVisible = false;
    this.confirmPasswordVisible = false;
    this.emailError = '';
    this.passwordError = '';
    this.confirmPasswordError = '';
    this.loginError = '';
  }

  // Helper method to get password strength indicator
  getPasswordStrength(password: string): { strength: string; color: string; width: string } {
    if (!password) return { strength: '', color: '', width: '0%' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score < 2) return { strength: 'Weak', color: '#ef4444', width: '25%' };
    if (score < 4) return { strength: 'Medium', color: '#f59e0b', width: '50%' };
    if (score < 5) return { strength: 'Strong', color: '#10b981', width: '75%' };
    return { strength: 'Very Strong', color: '#059669', width: '100%' };
  }
}