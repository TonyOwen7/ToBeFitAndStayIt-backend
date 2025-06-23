import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthStateService } from './services/auth-state/auth-state.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'ToBeFitAndStayIt';

  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private router: Router,
    private authState: AuthStateService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
  
  ngOnInit() {
    if (this.isBrowser) {
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.createParticles();
        }
      });
    }
    
  }
  

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.addParticleStyles();
    }
  }

  ngOnDestroy() {
    // Add any cleanup here if needed
  }

  private createParticles() {
    const container = document.getElementById('particles');
    if (container) {
      container.innerHTML = '';
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
          position: absolute;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          width: ${Math.random() * 4 + 2}px;
          height: ${Math.random() * 4 + 2}px;
          background: rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2});
          border-radius: 50%;
          animation: float ${Math.random() * 3 + 3}s infinite linear;
          animation-delay: ${Math.random() * 6}s;
        `;
        container.appendChild(particle);
      }
    }
  }

  private addParticleStyles() {
    if (!document.getElementById('particle-styles')) {
      const style = document.createElement('style');
      style.id = 'particle-styles';
      style.textContent = `
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }
}
