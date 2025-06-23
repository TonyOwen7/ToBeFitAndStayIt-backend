// terms-privacy.component.ts
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { RegisterFormState } from '../../../../models/register-form-state.model';
import { RegisterFormService } from '../../../../services/regiser-form/register-form.service';

@Component({
  selector: 'app-terms-privacy',
  templateUrl: './terms-privacy.component.html',
  styleUrls: ['./terms-privacy.component.css']
})
export class TermsPrivacyComponent implements OnInit {
  activeTab: string = 'terms';
  formState?: RegisterFormState;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private registerFormService: RegisterFormService // Assuming this service exists
  ) { }

  ngOnInit(): void {
    this.activeTab = this.registerFormService.getTab();  
    this.formState = this.registerFormService.getFormState();;
  }
  
  
  
  

  showSection(section: 'terms' | 'privacy'): void {
    this.activeTab = section;
    this.router.navigate([], { fragment: section }); // updates the URL without reload
  
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
    

  goBack(): void {
    console.log('Going back to previous page');
    console.log('Current form state:', this.formState);
    if (this.formState) {
      this.router.navigate(['/auth/register'], {
        state: { formState: this.formState } // ✅ ensure nested
      });
    } else {
      this.router.navigate(['/auth/register']);
    }
  }
  
}    