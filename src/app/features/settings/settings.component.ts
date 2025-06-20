// settings.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { SettingsService, UserProfile, UserUpdateData, PasswordChangeData } from '../../services/settings/settings.service';
import { AuthStateService } from '../../services/auth-state/auth-state.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  // User data
  user: UserProfile | null = null;
  
  // Loading states
  isLoading = false;
  isEditing = false;
  
  // Messages
  showSuccess = false;
  showError = false;
  successMessage = '';
  errorMessage = '';
  
  // Modals
  showChangePasswordModal = false;
  showDeleteAccountModal = false;
  deleteConfirmationText = '';
  
  // Form data
  editForm: UserUpdateData = this.getDefaultFormData();
  passwordForm: PasswordChangeData = { current_password: '', new_password: '', confirm_password: '' };
  
  private subscriptions = new Subscription();

  // Form options
  genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  activityLevelOptions = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Light (1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (3-5 days/week)' },
    { value: 'active', label: 'Active (6-7 days/week)' },
    { value: 'very-active', label: 'Very Active (physical job)' }
  ];

  healthGoalOptions = [
    { value: 'lose-weight', label: 'Lose Weight' },
    { value: 'maintain-weight', label: 'Maintain Weight' },
    { value: 'gain-weight', label: 'Gain Weight' },
    { value: 'build-muscle', label: 'Build Muscle' },
    { value: 'improve-fitness', label: 'Improve Fitness' },
    { value: 'general-health', label: 'General Health' }
  ];

  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
    private authStateService: AuthStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private getDefaultFormData(): UserUpdateData {
    return {
      email: '',
      first_name: '',
      last_name: '',
      age: null,
      gender: '',
      weight: null,
      height: null,
      activity_level: '',
      health_goal: '',
      wants_newsletter: false
    };
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.clearMessages();
    
    const sub = this.settingsService.getUserProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.initializeEditForm();
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Failed to load profile', error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }

  initializeEditForm(): void {
    if (this.user) {
      this.editForm = {
        email: this.user.email || '',
        first_name: this.user.first_name || '',
        last_name: this.user.last_name || '',
        age: this.user.age,
        gender: this.user.gender || '',
        weight: this.user.weight,
        height: this.user.height,
        activity_level: this.user.activity_level || '',
        health_goal: this.user.health_goal || '',
        wants_newsletter: this.user.wants_newsletter || false
      };
    }
  }

  startEditing(): void {
    this.isEditing = true;
    this.clearMessages();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.initializeEditForm();
    this.clearMessages();
  }

  saveProfile(): void {
    this.isLoading = true;
    this.clearMessages();
    
    const sub = this.settingsService.updateUserProfile(this.editForm).subscribe({
      next: (updatedProfile) => {
        this.user = updatedProfile;
        this.isEditing = false;
        this.showSuccessMessage('Profile updated successfully');
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Failed to update profile', error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }

  changePassword(): void {
    if (!this.validatePasswordChange()) return;
    
    this.isLoading = true;
    this.clearMessages();
    
    const sub = this.settingsService.changePassword(this.passwordForm).subscribe({
      next: () => {
        this.showSuccessMessage('Password changed successfully!');
        this.closeChangePasswordDialog();
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Failed to change password', error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }

  private validatePasswordChange(): boolean {
    if (this.passwordForm.new_password !== this.passwordForm.confirm_password) {
      this.showErrorMessage('New passwords do not match');
      return false;
    }
    
    if (this.passwordForm.new_password.length < 8) {
      this.showErrorMessage('Password must be at least 8 characters');
      return false;
    }
    
    return true;
  }

  deleteAccount(): void {
    if (this.deleteConfirmationText !== 'DELETE') {
      this.showErrorMessage('Type "DELETE" to confirm');
      return;
    }
    
    this.isLoading = true;
    this.clearMessages();

    
    const sub = this.settingsService.deleteAccount().subscribe({
      next: () => {
        const refreshToken = this.authService.getRefreshToken();
        this.authService.logout(refreshToken);
        this.authStateService.logout();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.handleError('Failed to delete account', error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.add(sub);
  }

  exportUserData(): void {
    const sub = this.settingsService.exportUserData().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showSuccessMessage('Data exported successfully!');
      },
      error: (error) => this.handleError('Export failed', error)
    });
    
    this.subscriptions.add(sub);
  }

  // Modal management
  openChangePasswordDialog(): void {
    this.showChangePasswordModal = true;
    this.resetPasswordForm();
  }

  closeChangePasswordDialog(): void {
    this.showChangePasswordModal = false;
    this.resetPasswordForm();
  }

  openDeleteAccountDialog(): void {
    this.showDeleteAccountModal = true;
    this.deleteConfirmationText = '';
  }

  closeDeleteAccountDialog(): void {
    this.showDeleteAccountModal = false;
    this.deleteConfirmationText = '';
  }

  private resetPasswordForm(): void {
    this.passwordForm = { current_password: '', new_password: '', confirm_password: '' };
  }

  // Utility functions
  getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  getBMIColor(bmi: number): string {
    if (bmi < 18.5) return '#3b82f6';  // Blue
    if (bmi < 25) return '#10b981';    // Green
    if (bmi < 30) return '#f59e0b';    // Orange
    return '#ef4444';                  // Red
  }

  getGenderLabel(value: string): string {
    return this.genderOptions.find(o => o.value === value)?.label || value;
  }

  getActivityLevelLabel(value: string): string {
    return this.activityLevelOptions.find(o => o.value === value)?.label || value;
  }

  getHealthGoalLabel(value: string): string {
    return this.healthGoalOptions.find(o => o.value === value)?.label || value;
  }

  // Message handling
  private showSuccessMessage(msg: string): void {
    this.successMessage = msg;
    this.showSuccess = true;
    this.hideMessageAfterDelay();
  }

  private showErrorMessage(msg: string): void {
    this.errorMessage = msg;
    this.showError = true;
    this.hideMessageAfterDelay();
  }

  private clearMessages(): void {
    this.showSuccess = false;
    this.showError = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => this.clearMessages(), 5000);
  }

  private handleError(defaultMessage: string, error: any): void {
    const message = error.message || error.error?.message || defaultMessage;
    this.showErrorMessage(message);
  }
}