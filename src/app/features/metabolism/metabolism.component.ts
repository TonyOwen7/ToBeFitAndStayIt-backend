import { Component } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MetabolismResult {
  bmr: number;
  tdee: number;
  weightLoss: number;
  weightGain: number;
  gender: string;
  activityLevel: number;
}

interface ActivityOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-metabolism',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './metabolism.component.html',
  styleUrls: ['./metabolism.component.css']
})
export class MetabolismComponent {
  // Form data
  age: number | null = null;
  gender: string = '';
  weight: number | null = null;
  height: number | null = null;
  activityLevel: number | null = null;

  // Results
  results: MetabolismResult | null = null;
  errorMessage: string = '';
  showResults: boolean = false;

  // Activity level options
  activityOptions: ActivityOption[] = [
    { value: 1.2, label: 'Sedentary (little/no exercise)' },
    { value: 1.375, label: 'Light (light exercise 1-3 days/week)' },
    { value: 1.55, label: 'Moderate (moderate exercise 3-5 days/week)' },
    { value: 1.725, label: 'Active (hard exercise 6-7 days/week)' },
    { value: 1.9, label: 'Very Active (very hard exercise, physical job)' }
  ];

  // Activity labels for display
  private activityLabels: { [key: string]: string } = {
    '1.2': 'Sedentary',
    '1.375': 'Light Activity',
    '1.55': 'Moderate Activity',
    '1.725': 'Active',
    '1.9': 'Very Active'
  };

  // ngOnInit(): void {
  //   this.createParticles();
  // }

  /**
   * Creates floating background particles
   */
  // private createParticles(): void {
  //   const container = document.getElementById('particles');
  //   if (!container) return;

  //   const particleCount = 20;
    
  //   for (let i = 0; i < particleCount; i++) {
  //     const particle = document.createElement('div');
  //     particle.className = 'particle';
  //     particle.style.left = Math.random() * 100 + '%';
  //     particle.style.top = Math.random() * 100 + '%';
  //     particle.style.animationDelay = Math.random() * 6 + 's';
  //     particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
  //     container.appendChild(particle);
  //   }
  // }

  /**
   * Validates all input fields
   */
  private validateInputs(): boolean {
    this.errorMessage = '';

    if (!this.age || !this.gender || !this.weight || !this.height || !this.activityLevel) {
      this.errorMessage = 'Please fill in all fields';
      return false;
    }

    if (this.age < 10 || this.age > 100) {
      this.errorMessage = 'Please enter a valid age between 10 and 100';
      return false;
    }

    if (this.weight < 30 || this.weight > 300) {
      this.errorMessage = 'Please enter a valid weight between 30 and 300 kg';
      return false;
    }

    if (this.height < 100 || this.height > 250) {
      this.errorMessage = 'Please enter a valid height between 100 and 250 cm';
      return false;
    }

    return true;
  }

  /**
   * Calculates BMR using Mifflin-St Jeor Equation
   */
  private calculateBMR(): number {
    if (!this.weight || !this.height || !this.age) return 0;

    if (this.gender === 'male') {
      return (10 * this.weight) + (6.25 * this.height) - (5 * this.age) + 5;
    } else {
      return (10 * this.weight) + (6.25 * this.height) - (5 * this.age) - 161;
    }
  }

  /**
   * Main calculation method
   */
  calculateMetabolism(): void {
    if (!this.validateInputs()) {
      this.showResults = false;
      return;
    }

    const bmr = this.calculateBMR();
    const tdee = bmr * this.activityLevel!;
    const weightLoss = tdee - 500; // 500 calorie deficit
    const weightGain = tdee + 300; // 300 calorie surplus

    this.results = {
      bmr,
      tdee,
      weightLoss,
      weightGain,
      gender: this.gender,
      activityLevel: this.activityLevel!
    };

    this.showResults = true;
    this.errorMessage = '';
    
    // Trigger animation after a short delay
    setTimeout(() => this.animateResults(), 100);
  }

  /**
   * Animates the appearance of result items
   */
  private animateResults(): void {
    const resultItems = document.querySelectorAll('.result-item');
    resultItems.forEach((item: Element, index: number) => {
      const htmlItem = item as HTMLElement;
      htmlItem.style.opacity = '0';
      htmlItem.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        htmlItem.style.transition = 'all 0.5s ease';
        htmlItem.style.opacity = '1';
        htmlItem.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }

  /**
   * Gets the activity label for display
   */
  getActivityLabel(): string {
    return this.activityLabels[this.activityLevel?.toString() || ''] || '';
  }

  /**
   * Gets the BMR formula based on gender
   */
  getBMRFormula(): string {
    if (this.gender === 'male') {
      return 'BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5';
    } else {
      return 'BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161';
    }
  }

  /**
   * Input validation for weight
   */
  onWeightChange(value: number): void {
    if (value < 0) {
      this.weight = 0;
    }
  }

  /**
   * Input validation for height
   */
  onHeightChange(value: number): void {
    if (value < 0) {
      this.height = 0;
    }
  }

  /**
   * Input validation for age
   */
  onAgeChange(value: number): void {
    if (value < 0) {
      this.age = 0;
    }
  }

  /**
   * Handle Enter key press for calculation
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.calculateMetabolism();
    }
  }

  /**
   * Handle input focus effects
   */
  onInputFocus(event: FocusEvent): void {
    const element = event.target as HTMLElement;
    const parent = element.parentElement;
    if (parent) {
      parent.style.transform = 'translateY(-2px)';
    }
  }

  /**
   * Handle input blur effects
   */
  onInputBlur(event: FocusEvent): void {
    const element = event.target as HTMLElement;
    const parent = element.parentElement;
    if (parent) {
      parent.style.transform = 'translateY(0)';
    }
  }
}