// login-modal.component.ts
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStateService } from '../../services/auth-state/auth-state.service';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-login-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnInit{
  @Input() isOpen = false;
  @Input() bottomValue: number | string = "auto";
  @Input() isRegisterMode = false;
  @Output() isclosed = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  constructor(
    private http: HttpClient, 
    private authService: AuthService,
    private authState: AuthStateService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Form fields
  email = '';
  password = '';
  confirmPassword = '';
  rememberMe = false;
  passwordVisible = false;
  confirmPasswordVisible = false;
  isLoading = false;
  isForgotPasswordMode = false;
  forgotPasswordEmail = '';
  forgotPasswordSuccess = false;
  forgotPasswordError = '';

  // Error messages
  emailError = '';
  passwordError = '';
  confirmPasswordError = '';
  loginError = '';

  // Validation patterns
  private emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const remembered = localStorage.getItem('rememberedEmail');
      if (remembered) this.email = remembered;
    }
  }

  switchToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
    this.isForgotPasswordMode = true;

    this.resetForm();
  }

  // Handle forgot password submission
  onForgotPasswordSubmit() {
    this.forgotPasswordError = '';
    const validation = this.validateEmail(this.forgotPasswordEmail);
    
    if (!validation.isValid) {
      this.forgotPasswordError = validation.message;
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.forgotPasswordSuccess = true;
      },
      error: (err) => {
        this.isLoading = false;
        this.forgotPasswordError = 'Failed to send reset email. Please try again.';
      }
    });

    this.router.navigate(['/forgot-password']);
  }

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
    // if (this.rememberMe) {
    //   localStorage.setItem('rememberedEmail', this.email);
    // } else {
    //   localStorage.removeItem('rememberedEmail');
    // }
    
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
    console.log('Attempting authentication with:', { email: this.email });

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
      next: (res: any) => {
        console.log(`${this.isRegisterMode ? 'Registration' : 'Login'} successful:`, res);
        
        this.isLoading = false;
        
        // Handle authentication response - both login and register now return tokens
        if (res && res.access) {
          // Create user profile from response
          const userProfile = {
            id: res.user?.id || res.id,
            username: res.user?.username || res.username || this.email.split('@')[0],
            email: res.user?.email || res.email || this.email,
            firstName: res.user?.first_name || res.first_name || '',
            lastName: res.user?.last_name || res.last_name || '',
          
            // Water needs–related fields
            gender: res.user?.gender || res.gender || 'male', // default fallback
            weight: res.user?.weight || res.weight || 70,
            age: res.user?.age || res.age || null,
            climate: res.user?.climate || res.climate || 'normal',
            activityLevel: res.user?.activityLevel || res.activityLevel || 'moderate'
          };
          
          
          // Update AuthStateService with token and user profile
          this.authState.login(res.access, userProfile);
          console.log('AuthStateService updated with login data');
        } else {
          console.warn('Authentication response missing token or user data:', res);
          // Fallback for unexpected response format
          const userProfile = {
            username: this.email.split('@')[0],
            email: this.email
          };
          this.authState.login('dummy-token', userProfile);
        }
                
        // Close modal
        this.close();
        
        // Navigate to dashboard or home page
        this.router.navigate(['/home']);
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

  // async socialLogin(provider: string) {
  //   if (provider === 'apple') {
  //     try {
  //       // Initiate Apple authentication
  //       const authResponse: any = await this.http.post(
  //         '/auth/apple/login/', 
  //         { redirect_uri: window.location.origin }
  //       ).toPromise();
  
  //       // Redirect to Apple's auth page
  //       window.location.href = authResponse.authorization_url;
  //     } catch (error) {
  //       console.error('Apple login failed:', error);
  //       this.loginError = 'Failed to initiate Apple login';
  //     }
  //   } else {
  //     alert(`${provider} login would be implemented similarly`);
  //   }
  // }

  switchToRegister() {
    this.isOpen = false;
    this.router.navigate(['/auth/register']);
  }

  switchToLogin() {
    this.isForgotPasswordMode = false;
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
    this.isForgotPasswordMode = false;
    this.forgotPasswordEmail = '';
    this.forgotPasswordSuccess = false;
    this.forgotPasswordError = '';
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