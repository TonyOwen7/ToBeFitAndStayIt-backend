import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginModalComponent } from '../../../auth/login-modal/login-modal.component';  // Adjust path as needed

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, LoginModalComponent], // Add LoginModalComponent here
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  @Input() isLoggedIn: boolean = false;
  @Input() title: string = "ToBeFitAndStayIt";
  @Input() subtitle: string = "Your Complete Wellness Journey";
  @Input() background: string = "linear-gradient(135deg, #ffd700 0%, #ffb347 30%, #ffa500 70%, #ff8f00 100%)";
  @Input() radiant: string = "radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)";
  @Input() border_auth_btn: string = "2px solid rgba(255, 215, 0, 0.6)";
  @Input() bottomValue :  string | number = "auto";

  @Output() loginSuccess = new EventEmitter<void>();
  @Output() logoutClicked = new EventEmitter<void>();

  showLoginModal = false;

  constructor(private router: Router) {}

  openLoginModal() {
    console.log('Opening login modal from header');
    this.showLoginModal = true;
  }

  onLoginModalClose() {
    console.log('Login modal closed');
    this.showLoginModal = false;
  }

  onLoginSuccess() {
    console.log('Login successful in header');
    this.showLoginModal = false;
    this.loginSuccess.emit(); // Emit to parent component if needed
  }

  logout() {
    console.log('Logout clicked');
    this.logoutClicked.emit(); // Emit to parent component
  }

  onRegisterClick() {
    this.router.navigate(['/register']);
  }
}