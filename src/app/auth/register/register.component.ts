// register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: `./register.component.html`,
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: null,
    gender: '',
    weight: null,
    height: null,
    activityLevel: '',
    healthGoal: '',
    wantsNewsletter: false
  };

  showResults = false;
  calculatedBMR = 0;
  calculatedTDEE = 0;

  onSubmit(form: any) {
    if (form.valid && this.userData.password === this.userData.confirmPassword) {
      this.calculateMetabolism();
      this.showResults = true;

      
      
      
      // Here you would typically send the data to your backend service
      console.log('Registration data:', this.userData);
      console.log('BMR:', this.calculatedBMR);
      console.log('TDEE:', this.calculatedTDEE);
    }
  }

  calculateMetabolism() {
    const { age, gender, weight, height, activityLevel } = this.userData;
    
    if (!age || !gender || !weight || !height || !activityLevel) {
      return;
    }

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }

    // Calculate TDEE
    const tdee = bmr * parseFloat(activityLevel);
    
    this.calculatedBMR = Math.round(bmr);
    this.calculatedTDEE = Math.round(tdee);
  }

  closeResults() {
    this.showResults = false;
    // Here you might want to navigate to a dashboard or login page
    // this.router.navigate(['/dashboard']);
  }
}