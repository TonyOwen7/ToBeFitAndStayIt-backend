import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { LoginModalComponent } from '../../../auth/login-modal/login-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, HeaderComponent, FooterComponent, LoginModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isLoginModalOpen = false;
  
  // Progress data for demo
  waterProgress = 65;
  sleepProgress = 80;
  nutritionProgress = 60;
  
  waterText = '1.6L / 2.5L daily goal';
  sleepText = '6.4h / 8h sleep goal';
  nutritionText = '1,240 / 2,000 calories';

  // Interest selection for mobile app
  selectedInterest: string | null = null;
  interestFeedback = '';

  showLoginModal = false;
  isLoggedIn = false;
  userName = '';

  openLoginModal() {
    console.log('Login modal triggered'); // ✅ Confirm in browser dev console
    this.showLoginModal = false;
  }

  onLoginModalClose() {
    this.showLoginModal = false;
  }

  onLoginSuccess() {
    this.isLoggedIn = true;
    this.userName = 'Demo User';
    alert('Welcome back! You can now access all features.');
  }

  logout() {
    this.isLoggedIn = false;
    this.userName = '';
    alert('You have been logged out successfully.');
  }

  // Update header buttons
  getHeaderButtons() {
    if (this.isLoggedIn) {
      return `
        <button class="nav-btn">Dashboard</button>
        <button class="nav-btn">Profile</button>
        <button class="nav-btn login-btn" (click)="logout()">Welcome, ${this.userName}</button>
      `;
    } else {
      return `
        <button class="nav-btn">About</button>
        <button class="nav-btn">Features</button>
        <button class="nav-btn">Contact</button>
        <button class="nav-btn login-btn" (click)="openLoginModal()">Sign In</button>
      `;
    }
  }

  selectInterest(interest: string, event: Event) {
    this.selectedInterest = interest;
    
    // Remove selected class from all buttons
    const buttons = document.querySelectorAll('.interest-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    (event.target as HTMLElement).classList.add('selected');
    
    // Set feedback message
    switch(interest) {
      case 'yes':
        this.interestFeedback = '🎉 Awesome! We\'ll prioritize mobile app development and keep you updated.';
        break;
      case 'maybe':
        this.interestFeedback = '🤔 We\'d love to hear what features would make a mobile app valuable for you!';
        break;
      case 'no':
        this.interestFeedback = '👍 No problem! We\'ll continue improving the web experience for you.';
        break;
    }
    
    // Show feedback
    const feedbackElement = document.getElementById('interest-feedback');
    if (feedbackElement) {
      feedbackElement.style.display = 'block';
      feedbackElement.textContent = this.interestFeedback;
    }
  }

  private showNotification(message: string, type: 'info' | 'error' = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    
    const bgColor = type === 'error' ? 
      'linear-gradient(135deg, #f44336, #d32f2f)' : 
      'linear-gradient(135deg, #8bc34a, #689f38)';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 20px 30px;
      border-radius: 15px;
      font-size: 1rem;
      font-weight: 600;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
      border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 14px;">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }
}