// settings.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthStateService } from '../../../services/auth-state/auth-state.service';
import { UserProfile } from '../../../models/user-profile.model';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  userProfile: UserProfile = {
    firstName: '',
    lastName: '',
    email: '',
    age: 0,
    gender: '',
    weight: 0,
    height: 0,
    activityLevel: '',
    healthGoal: '',
    climate: ''
  };
  
  passwordData = {
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  };
  
  showProfileSuccess = false;
  showPasswordSuccess = false;
  showError = false;
  errorMessage = '';
  
  isUpdatingProfile = false;
  isChangingPassword = false;
  isDeletingAccount = false;
  
  currentPasswordVisible = false;
  newPasswordVisible = false;
  confirmNewPasswordVisible = false;
  
  showDeleteModal = false;
  deletePassword = '';

  uid: string = '';
token: string = '';

  constructor(
    private authService: AuthService,
    private authState: AuthStateService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,

  ) {}


  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const user = this.authState.getCurrentUser();
    if (user) {
      this.userProfile = { ...user };
    }
  }

  updateProfile(): void {
    this.isUpdatingProfile = true;
    this.showError = false;
    this.showProfileSuccess = false;
  
    try {
      this.authState.updateUserProfile(this.userProfile);
  
      // Temporarily assume success unless you want to refactor for feedback from service
      this.isUpdatingProfile = false;
      this.showProfileSuccess = true;
  
      // Auto-hide success toast/message
      setTimeout(() => {
        this.showProfileSuccess = false;
      }, 3000);
    } catch (error) {
      console.error('❌ Error during profile update:', error);
      this.isUpdatingProfile = false;
      this.showError = true;
      this.errorMessage = 'Failed to update profile. Please try again.';
    }
  }
  

  changePassword(): void {
    if (this.passwordData.new_password !== this.passwordData.confirm_new_password) {
      this.showError = true;
      this.errorMessage = 'New passwords do not match';
      return;
    }
    
    this.isChangingPassword = true;
    this.showError = false;
    this.showPasswordSuccess = false;

    this.route.params.subscribe(params => {
        this.uid = params['uid'];
        this.token = params['token'];
      });
    
    this.authService.resetPassword(
      this.uid,
      this.token,
      this.passwordData.new_password
    ).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.showPasswordSuccess = true;
        this.passwordData = {
          current_password: '',
          new_password: '',
          confirm_new_password: ''
        };
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showPasswordSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.isChangingPassword = false;
        this.showError = true;
        this.errorMessage = err.error?.message || 'Failed to change password. Please try again.';
      }
    });
  }

  confirmDeleteAccount(): void {
    this.showDeleteModal = true;
    this.deletePassword = '';
  }

  deleteAccount(): void {
    if (!this.deletePassword) {
      this.showError = true;
      this.errorMessage = 'Please enter your password to confirm account deletion';
      return;
    }
    
    this.isDeletingAccount = true;
    this.showError = false;
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authState.getAuthToken()}`
    });
    
    this.http.post(
      `${environment.apiUrl}/user/delete-account/`,
      { current_password: this.deletePassword },
      { headers }
    ).subscribe({
      next: () => {
        this.isDeletingAccount = false;
        this.showDeleteModal = false;
        this.authState.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isDeletingAccount = false;
        this.showError = true;
        this.errorMessage = err.error?.message || 'Failed to delete account. Please try again.';
      }
    });
  }

  toggleCurrentPasswordVisibility(): void {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  toggleNewPasswordVisibility(): void {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmNewPasswordVisibility(): void {
    this.confirmNewPasswordVisible = !this.confirmNewPasswordVisible;
  }
}