import { Component, OnInit, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { AppInterestService } from '../../../app-interest/app-interest.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
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

  // Connected user features
  currentSection = 'dashboard'; // dashboard, tips, settings
  
  // Dashboard data
  dashboardStats = {
    totalDays: 45,
    streakDays: 12,
    avgSleep: 7.2,
    avgWater: 2.1,
    weeklyGoals: 4
  };

  // Tips data
  tipsCategories = [
    {
      id: 'hydration',
      title: 'Hydration Tips',
      icon: '💧',
      tips: [
        'Start your day with a glass of water to kickstart your metabolism',
        'Add lemon or cucumber to make water more appealing',
        'Set hourly reminders to drink water throughout the day',
        'Monitor urine color as a hydration indicator'
      ]
    },
    {
      id: 'sleep',
      title: 'Sleep Optimization',
      icon: '😴',
      tips: [
        'Maintain a consistent sleep schedule, even on weekends',
        'Create a cool, dark environment for better sleep quality',
        'Avoid screens 1 hour before bedtime',
        'Try the 4-7-8 breathing technique for faster sleep onset'
      ]
    },
    {
      id: 'nutrition',
      title: 'Nutrition Guidance',
      icon: '🥗',
      tips: [
        'Eat protein with every meal to maintain stable blood sugar',
        'Fill half your plate with colorful vegetables',
        'Practice mindful eating - chew slowly and savor flavors',
        'Plan meals in advance to avoid impulsive food choices'
      ]
    },
    {
      id: 'metabolism',
      title: 'Metabolism Boosters',
      icon: '🔥',
      tips: [
        'Include strength training to build muscle mass',
        'Eat protein-rich foods to increase thermic effect',
        'Stay hydrated to support metabolic processes',
        'Get adequate sleep to regulate hormones that affect metabolism'
      ]
    }
  ];

  // Settings data
  userSettings = {
    notifications: {
      waterReminders: true,
      sleepReminders: true,
      mealReminders: false,
      weeklyReports: true
    },
    goals: {
      dailyWater: 2.5,
      sleepHours: 8,
      dailyCalories: 2000,
      weeklyExercise: 5
    },
    privacy: {
      shareProgress: false,
      publicProfile: false,
      dataAnalytics: true
    }
  };

  // Animation and cleanup
  private animationFrameId?: number;
  private notificationTimeouts: NodeJS.Timeout[] = [];
  private isBrowser: boolean;

  interestResponse: string | null = null;

  submitted = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private interestService: AppInterestService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Only run browser-specific code when in browser environment
    if (this.isBrowser) {
      this.loadUserPreferences();
      this.updateProgressData();
    }

    
  }

  ngAfterViewInit() {
    // Only run DOM-dependent code in browser
    if (this.isBrowser) {
      // Initialize any animations or additional setup
      setTimeout(() => {
        this.animateProgress();
      }, 500);

    }
  }

  ngOnDestroy() {
    // Cleanup animations and timeouts
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.notificationTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  // Authentication methods
  logout() {
    this.isLoggedIn = false;
    this.userName = '';
    this.currentSection = 'dashboard';
    this.clearUserData();
    this.showNotification('You have been logged out successfully.');
  }

  // Mock login for demo
  mockLogin() {
    this.isLoggedIn = true;
    this.userName = 'Alex Johnson';
    this.currentSection = 'dashboard';
    this.saveUserPreferences();
    this.showNotification('Welcome back, ' + this.userName + '!');
  }

  // Navigation methods
  navigateToSection(section: string) {
    this.currentSection = section;
    // Smooth scroll to top when switching sections (only in browser)
    if (this.isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  
  // Progress animation
  animateProgress() {
    if (!this.isBrowser) return;
    
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
      setTimeout(() => {
        (bar as HTMLElement).style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        (bar as HTMLElement).style.transform = 'scaleX(1)';
      }, index * 200);
    });
  }

  // Mobile app interest selection
  selectInterest(interest: string, event: Event) {
    if (!this.isBrowser) return;
    
    this.selectedInterest = interest;
    
    // Remove selected class from all buttons
    const buttons = document.querySelectorAll('.interest-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    (event.target as HTMLElement).classList.add('selected');
    
    // Set feedback message
    const feedbackMessages = {
      yes: '🎉 Awesome! We\'ll prioritize mobile app development and keep you updated.',
      maybe: '🤔 We\'d love to hear what features would make a mobile app valuable for you!',
      no: '👍 No problem! We\'ll continue improving the web experience for you.'
    };
    
    this.interestFeedback = feedbackMessages[interest as keyof typeof feedbackMessages] || '';
    
    // Animate feedback appearance
    setTimeout(() => {
      const feedbackElement = document.getElementById('interest-feedback');
      if (feedbackElement) {
        feedbackElement.style.opacity = '0';
        feedbackElement.style.transform = 'translateY(10px)';
        feedbackElement.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          feedbackElement.style.opacity = '1';
          feedbackElement.style.transform = 'translateY(0)';
        }, 50);
      }
    }, 100);
  }

  // Settings management methods
  updateNotificationSetting(setting: string, value: boolean) {
    (this.userSettings.notifications as any)[setting] = value;
    this.saveUserPreferences();
    const settingDisplayName = this.formatSettingName(setting);
    this.showNotification(`${settingDisplayName} ${value ? 'enabled' : 'disabled'}`);
  }

  updateGoalSetting(goal: string, value: string | number) {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    (this.userSettings.goals as any)[goal] = numValue;
    this.saveUserPreferences();
    this.updateProgressBasedOnGoals();
    const goalDisplayName = this.formatSettingName(goal);
    this.showNotification(`${goalDisplayName} updated to ${numValue}`);
  }

  updatePrivacySetting(setting: string, value: boolean) {
    (this.userSettings.privacy as any)[setting] = value;
    this.saveUserPreferences();
    const settingDisplayName = this.formatSettingName(setting);
    this.showNotification(`${settingDisplayName} ${value ? 'enabled' : 'disabled'}`);
  }

  // Utility method to format setting names
  private formatSettingName(setting: string): string {
    return setting
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .toLowerCase()
      .replace(/^./, str => str.toUpperCase());
  }

  // Data management
  exportUserData() {
    if (!this.isBrowser) return;
    
    const data = {
      userInfo: {
        name: this.userName,
        isLoggedIn: this.isLoggedIn
      },
      stats: this.dashboardStats,
      settings: this.userSettings,
      progress: {
        water: this.waterProgress,
        sleep: this.sleepProgress,
        nutrition: this.nutritionProgress
      },
      exportDate: new Date().toISOString()
    };
    
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wellness-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('Your data has been exported successfully!');
    } catch (error) {
      this.showNotification('Failed to export data. Please try again.', 'error');
    }
  }

  // Account deletion
  deleteAccount() {
    if (!this.isBrowser) return;
    
    const confirmation = confirm(
      'Are you sure you want to delete your account?\n\n' +
      'This will permanently remove:\n' +
      '• All your wellness data\n' +
      '• Personal settings and preferences\n' +
      '• Progress history\n\n' +
      'This action cannot be undone.'
    );
    
    if (confirmation) {
      // Simulate account deletion process
      this.showNotification('Account deletion initiated. You will receive a confirmation email within 24 hours.', 'error');
      
      // Clear all data after a delay
      setTimeout(() => {
        this.logout();
        this.clearAllData();
      }, 2000);
    }
  }

  // Data persistence methods
  private saveUserPreferences() {
    if (this.isLoggedIn) {
      const data = {
        settings: this.userSettings,
        stats: this.dashboardStats,
        userName: this.userName
      };
      // In a real app, this would be sent to a backend service
      console.log('Saving user preferences:', data);
    }
  }

  private loadUserPreferences() {
    // In a real app, this would load from a backend service
    // For demo purposes, we'll use some default loaded data
    console.log('Loading user preferences...');
  }

  private clearUserData() {
    // Reset to default values
    this.userSettings = {
      notifications: {
        waterReminders: true,
        sleepReminders: true,
        mealReminders: false,
        weeklyReports: true
      },
      goals: {
        dailyWater: 2.5,
        sleepHours: 8,
        dailyCalories: 2000,
        weeklyExercise: 5
      },
      privacy: {
        shareProgress: false,
        publicProfile: false,
        dataAnalytics: true
      }
    };
  }

  private clearAllData() {
    this.clearUserData();
    this.dashboardStats = {
      totalDays: 0,
      streakDays: 0,
      avgSleep: 0,
      avgWater: 0,
      weeklyGoals: 0
    };
    this.waterProgress = 0;
    this.sleepProgress = 0;
    this.nutritionProgress = 0;
  }

  // Update progress based on current goals
  private updateProgressData() {
    if (!this.isBrowser) return;
    
    // Simulate real-time progress updates
    const updateInterval: NodeJS.Timeout = setInterval(() => {
      if (this.isLoggedIn) {
        // Small random fluctuations to simulate real data
        this.waterProgress = Math.min(100, this.waterProgress + (Math.random() - 0.5) * 2);
        this.sleepProgress = Math.min(100, this.sleepProgress + (Math.random() - 0.5) * 1);
        this.nutritionProgress = Math.min(100, this.nutritionProgress + (Math.random() - 0.5) * 1.5);
        
        // Update text based on progress
        this.updateProgressText();
      }
    }, 30000); // Update every 30 seconds

    // Ensure notificationTimeouts can hold Timeout objects
    this.notificationTimeouts.push(updateInterval);
  }

  private updateProgressBasedOnGoals() {
    // Recalculate progress percentages based on new goals
    const currentWaterIntake = (this.waterProgress / 100) * 2.5; // Assuming previous goal was 2.5L
    this.waterProgress = Math.min(100, (currentWaterIntake / this.userSettings.goals.dailyWater) * 100);
    
    const currentSleepHours = (this.sleepProgress / 100) * 8; // Assuming previous goal was 8h
    this.sleepProgress = Math.min(100, (currentSleepHours / this.userSettings.goals.sleepHours) * 100);
    
    const currentCalories = (this.nutritionProgress / 100) * 2000; // Assuming previous goal was 2000 cal
    this.nutritionProgress = Math.min(100, (currentCalories / this.userSettings.goals.dailyCalories) * 100);
    
    this.updateProgressText();
  }

  private updateProgressText() {
    const waterActual = (this.waterProgress / 100) * this.userSettings.goals.dailyWater;
    const sleepActual = (this.sleepProgress / 100) * this.userSettings.goals.sleepHours;
    const caloriesActual = (this.nutritionProgress / 100) * this.userSettings.goals.dailyCalories;
    
    this.waterText = `${waterActual.toFixed(1)}L / ${this.userSettings.goals.dailyWater}L daily goal`;
    this.sleepText = `${sleepActual.toFixed(1)}h / ${this.userSettings.goals.sleepHours}h sleep goal`;
    this.nutritionText = `${Math.round(caloriesActual)} / ${this.userSettings.goals.dailyCalories} calories`;
  }

  // Enhanced notification system
  private showNotification(message: string, type: 'info' | 'error' | 'success' = 'info') {
    if (!this.isBrowser) return;
    
    const notification = document.createElement('div');
    
    const colors = {
      info: 'linear-gradient(135deg, #2196f3, #1976d2)',
      success: 'linear-gradient(135deg, #8bc34a, #689f38)',
      error: 'linear-gradient(135deg, #f44336, #d32f2f)'
    };
    
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
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
      backdrop-filter: blur(10px);
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.2rem;">${icons[type]}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 25px; height: 25px; cursor: pointer; font-size: 14px; font-weight: bold;">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    const timeoutId = setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 5000);
    
    this.notificationTimeouts.push(timeoutId);
  }

  submitAppInterest(choice: 'yes' | 'maybe' | 'no') {
    this.interestResponse = null;

    this.interestService.submitInterest(choice).subscribe({
      next: res => {
        this.interestResponse = res.message;
      },
      error: err => {
        this.interestResponse = err.error?.error || 'Something went wrong';
      }
    });
  }
}