import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
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
}