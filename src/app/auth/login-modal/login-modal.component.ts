import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-modal',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Input() isOpen = false;
  @Output() isclosed = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

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

    // Simulate API call
    setTimeout(() => {
      if (this.email === 'demo@tobefitandstayit.com' && this.password === 'demo123') {
        this.loginSuccess.emit();
        this.close();
      } else {
        this.loginError = 'Invalid email or password. Try: demo@tobefitandstayit.com / demo123';
      }
      this.isLoading = false;
    }, 1500);
  }

  socialLogin(provider: string) {
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login would be implemented here.`);
  }

  switchToRegister() {
    alert('Registration modal would be shown here.');
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