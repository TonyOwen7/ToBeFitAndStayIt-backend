import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AuthStateService } from '../../services/auth-state/auth-state.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule, LoginModalComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Input() isLoggedIn: boolean = false;
  @Input() title: string = "ToBeFitAndStayIt";
  @Input() subtitle: string = "Your Complete Wellness Journey";
  @Input() background: string = "linear-gradient(135deg, #ffd700 0%, #ffb347 30%, #ffa500 70%, #ff8f00 100%)";
  @Input() radiant: string = "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)";
  @Input() border_auth_btn: string = "2px solid rgba(255, 215, 0, 0.6)";
  @Input() bottomValue: number | string = 0;

  @Output() loginSuccess = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  // Form fields - fixed to match backend expectations
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  username: string = ''; // Added username field
  age: number | null = null;
  gender: string = '';
  password: string = '';
  confirmPassword: string = '';
  activityLevel: string = '';
  healthGoal: string = '';
  agreeTerms: boolean = false;
  agreeNewsletter: boolean = false;
  weight: number | null = null;
  height: number | null = null;

  // UI state  
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  isLoading: boolean = false;
  showSuccess: boolean = false;
  showError: boolean = false;
  showLoginModal: boolean = false;
  errorMessage: string = '';
  
  // Metabolism calculation results
  showResults: boolean = false;
  calculatedBMR: number = 0;
  calculatedTDEE: number = 0;

  constructor(
    private authService: AuthService,
    private authState: AuthStateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize component
  }

  onSubmit(form?: any): void {
    const isFormValid = form ? form.valid : this.isFormValid();
    
    if (isFormValid && this.password === this.confirmPassword) {
      this.isLoading = true;
      this.showError = false;
      this.showSuccess = false;
      this.errorMessage = '';

      // Generate username if not provided
      if (!this.username) {
        this.username = this.email.split('@')[0];
      }

      // Calculate metabolism if we have the required data
      this.calculateMetabolism();

      // Prepare registration data - match backend field names exactly
      const registrationData = {
        username: this.username,
        email: this.email,
        password: this.password,
        confirm_password: this.confirmPassword, // Backend expects confirm_password
        first_name: this.firstName,
        last_name: this.lastName,
        age: this.age,
        gender: this.gender,
        weight: this.weight,
        height: this.height,
        activity_level: this.activityLevel, // Backend expects activity_level
        health_goal: this.healthGoal, // Backend expects health_goal
        wants_newsletter: this.agreeNewsletter // Backend expects wants_newsletter
      };

      console.log('Sending registration data:', registrationData);

      this.authService.register(registrationData).subscribe({
        next: (res) => {
          console.log('Registration successful:', res);
          this.isLoading = false;
          this.showSuccess = true;
          
          if (this.calculatedBMR > 0 && this.calculatedTDEE > 0) {
            this.showResults = true;
          }
          
          this.resetForm();
          
          setTimeout(() => {
            this.showSuccess = false;
            if (!this.showResults) {
              this.router.navigate(['/login']);
            }
          }, 5000);
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.isLoading = false;
          this.showError = true;
          
          // Handle different types of errors
          if (err.error) {
            if (typeof err.error === 'string') {
              this.errorMessage = err.error;
            } else if (err.error.email) {
              this.errorMessage = Array.isArray(err.error.email) ? err.error.email[0] : err.error.email;
            } else if (err.error.username) {
              this.errorMessage = Array.isArray(err.error.username) ? err.error.username[0] : err.error.username;
            } else if (err.error.non_field_errors) {
              this.errorMessage = Array.isArray(err.error.non_field_errors) ? err.error.non_field_errors[0] : err.error.non_field_errors;
            } else {
              this.errorMessage = 'Registration failed. Please try again.';
            }
          } else {
            this.errorMessage = 'Registration failed. Please check your connection.';
          }
        }
      });
    } else {
      this.showError = true;
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match';
      } else {
        this.errorMessage = 'Please fill in all required fields';
      }
    }
  }

  calculateMetabolism(): void {
    const { age, gender, weight, height, activityLevel } = {
      age: this.age,
      gender: this.gender,
      weight: this.weight,
      height: this.height,
      activityLevel: this.activityLevel
    };

    if (!age || !gender || !weight || !height || !activityLevel) {
      return;
    }

    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    let activityMultiplier: number;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'very-active':
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.2;
    }

    const tdee = bmr * activityMultiplier;
    this.calculatedBMR = Math.round(bmr);
    this.calculatedTDEE = Math.round(tdee);
  }

  closeResults(): void {
    this.showResults = false;
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  getPasswordStrength(): string {
    if (!this.password) return '';
    
    const password = this.password;
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 3) return 'fair';
    if (score <= 4) return 'good';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return '';
    }
  }

  socialRegister(provider: string): void {
    console.log(`Register with ${provider}`);
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.showSuccess = true;
      
      setTimeout(() => {
        this.showSuccess = false;
      }, 3000);
    }, 1500);
  }

  openLoginModal(): void {
    console.log('Opening login modal from register');
    this.showLoginModal = true;
  }

  onLoginModalClose(): void {
    console.log('Login modal closed');
    this.showLoginModal = false;
  }


  private isFormValid(): boolean {
    return !!(
      this.firstName.trim() &&
      this.lastName.trim() &&
      this.email.trim() &&
      this.password.length >= 8 &&
      this.confirmPassword.length >= 8 &&
      this.agreeTerms
    );
  }

  private resetForm(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.username = '';
    this.age = null;
    this.gender = '';
    this.password = '';
    this.confirmPassword = '';
    this.activityLevel = '';
    this.healthGoal = '';
    this.weight = null;
    this.height = null;
    this.agreeTerms = false;
    this.agreeNewsletter = false;
    this.passwordVisible = false;
    this.confirmPasswordVisible = false;
    this.errorMessage = '';
  }
}