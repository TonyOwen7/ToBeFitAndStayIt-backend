import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface FoodItem {
  id: number;
  name: string;
  quantity: number;
  caloriesPerUnit: number;
  totalCalories: number;
}

interface Recommendation {
  title: string;
  text: string;
}

type PeriodType = 'days' | 'weeks' | 'months';
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

@Component({
  selector: 'app-nutrition',
  imports: [FormsModule, CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.css']
})
export class NutritionComponent implements OnInit {
  // Food tracking properties
  foodItems: FoodItem[] = [];
  totalCalories: number = 0;
  foodName: string = '';
  quantity: number | null = null;
  caloriesPerUnit: number | null = null;

  // Personal information properties
  currentWeight: number = 0;
  height: number | null = null; // in cm
  age: number | null = null;
  gender: Gender = 'female';
  activityLevel: ActivityLevel = 'moderate';

  // Weight and goal properties
  targetWeight: number | null = null;
  timePeriod: number | null = null;
  periodType: PeriodType = 'weeks';
  dailyCalorieTarget: number = 2000;

  // UI state properties
  recommendations: Recommendation[] = [];

  // Activity level multipliers for TDEE calculation
  private activityMultipliers = {
    sedentary: 1.2,     // Little to no exercise
    light: 1.375,       // Light exercise 1-3 days/week
    moderate: 1.55,     // Moderate exercise 3-5 days/week
    active: 1.725,      // Heavy exercise 6-7 days/week
    very_active: 1.9    // Very heavy exercise, physical job
  };

  ngOnInit(): void {
    this.updateRecommendations();
  }

  // Food management methods
  addFood(): void {
    if (!this.foodName || !this.quantity || !this.caloriesPerUnit) {
      alert('Please fill in all fields');
      return;
    }

    const totalItemCalories = this.quantity * this.caloriesPerUnit;
    const foodItem: FoodItem = {
      id: Date.now(),
      name: this.foodName,
      quantity: this.quantity,
      caloriesPerUnit: this.caloriesPerUnit,
      totalCalories: totalItemCalories
    };

    this.foodItems.push(foodItem);
    this.totalCalories += totalItemCalories;
    
    this.clearInputs();
    this.updateRecommendations();
  }

  removeFood(id: number): void {
    const item = this.foodItems.find(item => item.id === id);
    if (item) {
      this.totalCalories -= item.totalCalories;
      this.foodItems = this.foodItems.filter(item => item.id !== id);
      this.updateRecommendations();
    }
  }

  clearInputs(): void {
    this.foodName = '';
    this.quantity = null;
    this.caloriesPerUnit = null;
  }

  // Personal information methods
  setGender(gender: Gender): void {
    this.gender = gender;
    this.calculateGoal();
  }

  setActivityLevel(level: ActivityLevel): void {
    this.activityLevel = level;
    this.calculateGoal();
  }

  updatePersonalInfo(): void {
    this.calculateGoal();
  }

  // Period and goal management
  setPeriod(type: PeriodType): void {
    this.periodType = type;
    this.calculateGoal();
  }

  updateCurrentWeight(): void {
    this.calculateGoal();
  }

  // Enhanced BMR calculation using Mifflin-St Jeor Equation
  private calculateBMR(): number {
    if (!this.currentWeight || !this.height || !this.age) {
      // Fallback to simplified calculation if missing data
      return this.currentWeight * 24;
    }

    let bmr: number;
    
    if (this.gender === 'male') {
      // BMR for men: 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
      bmr = (10 * this.currentWeight) + (6.25 * this.height) - (5 * this.age) + 5;
    } else {
      // BMR for women: 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
      bmr = (10 * this.currentWeight) + (6.25 * this.height) - (5 * this.age) - 161;
    }

    return Math.round(bmr);
  }

  // Calculate Total Daily Energy Expenditure (TDEE)
  private calculateTDEE(): number {
    const bmr = this.calculateBMR();
    const activityMultiplier = this.activityMultipliers[this.activityLevel];
    return Math.round(bmr * activityMultiplier);
  }

  calculateGoal(): void {
    if (!this.currentWeight || !this.targetWeight || !this.timePeriod) {
      return;
    }

    const weightDifference = this.targetWeight - this.currentWeight;
    
    // Convert time period to days
    let days: number;
    switch(this.periodType) {
      case 'days': days = this.timePeriod; break;
      case 'weeks': days = this.timePeriod * 7; break;
      case 'months': days = this.timePeriod * 30; break;
    }
    
    // Calculate daily calorie adjustment (1 kg ≈ 7700 calories)
    const totalCalorieChange = weightDifference * 7700;
    const dailyCalorieChange = totalCalorieChange / days;
    
    // Use TDEE as base instead of simplified BMR
    const maintenanceCalories = this.calculateTDEE();
    this.dailyCalorieTarget = Math.round(maintenanceCalories + dailyCalorieChange);
    
    // Apply safety limits based on gender
    const minCalories = this.gender === 'male' ? 1500 : 1200;
    const maxCalories = this.gender === 'male' ? 4500 : 4000;
    
    this.dailyCalorieTarget = Math.max(minCalories, Math.min(maxCalories, this.dailyCalorieTarget));
    
    this.updateRecommendations();
  }

  // Computed properties
  get calorieProgress(): number {
    if (this.dailyCalorieTarget > 0) {
      return Math.min((this.totalCalories / this.dailyCalorieTarget) * 100, 100);
    }
    return 0;
  }

  get progressText(): string {
    return `${Math.round(this.calorieProgress)}% of daily target`;
  }

  get remainingCalories(): number {
    return this.dailyCalorieTarget - this.totalCalories;
  }

  get currentWeightDisplay(): string {
    return this.currentWeight ? this.currentWeight.toString() : '--';
  }

  get dailyCalorieTargetDisplay(): string {
    return this.dailyCalorieTarget.toString();
  }

  get hasNoFoodItems(): boolean {
    return this.foodItems.length === 0;
  }

  get bmrDisplay(): string {
    const bmr = this.calculateBMR();
    return bmr.toString();
  }

  get tdeeDisplay(): string {
    const tdee = this.calculateTDEE();
    return tdee.toString();
  }

  // Enhanced recommendations logic
  updateRecommendations(): void {
    const recommendations: Recommendation[] = [];

    if (this.currentWeight && this.targetWeight && this.dailyCalorieTarget) {
      const weightDifference = this.targetWeight - this.currentWeight;
      const remaining = this.remainingCalories;
      const bmr = this.calculateBMR();

      // Gender-specific recommendations
      if (weightDifference > 0) {
        const genderSpecificAdvice = this.gender === 'male' 
          ? 'Focus on protein-rich foods and strength training to build lean muscle mass.'
          : 'Include healthy fats and nutrient-dense foods. Consider iron-rich foods if needed.';
        
        recommendations.push({
          title: "Weight Gain Goal",
          text: `You're aiming to gain ${Math.abs(weightDifference).toFixed(1)} kg. ${genderSpecificAdvice}`
        });
      } else if (weightDifference < 0) {
        const genderSpecificAdvice = this.gender === 'male'
          ? 'Maintain protein intake to preserve muscle mass during weight loss.'
          : 'Ensure adequate calcium and iron intake while maintaining a moderate deficit.';
        
        recommendations.push({
          title: "Weight Loss Goal",
          text: `You're aiming to lose ${Math.abs(weightDifference).toFixed(1)} kg. ${genderSpecificAdvice}`
        });
      }

      // BMR-based recommendations
      if (this.totalCalories < bmr) {
        recommendations.push({
          title: "Below BMR Warning",
          text: `Your intake (${this.totalCalories} cal) is below your BMR (${bmr} cal). This may slow your metabolism and affect your health.`
        });
      }

      if (remaining > 0) {
        recommendations.push({
          title: "Calories Remaining Today",
          text: `You have ${remaining} calories left. Consider adding balanced meals with whole foods.`
        });
      } else if (remaining < 0) {
        recommendations.push({
          title: "Daily Target Exceeded",
          text: `You've exceeded your target by ${Math.abs(remaining)} calories. Adjust portion sizes or increase activity.`
        });
      }

      // Activity level recommendations
      if (this.activityLevel === 'sedentary') {
        recommendations.push({
          title: "Activity Recommendation",
          text: "Consider increasing your activity level. Even light exercise can improve your metabolism and health."
        });
      }
    }

    if (!this.height || !this.age) {
      recommendations.push({
        title: "Complete Your Profile",
        text: "Add your height and age for more accurate calorie calculations based on scientific formulas."
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Get Started",
        text: "Complete your profile and set your weight goal to receive personalized, gender-specific recommendations."
      });
    }

    this.recommendations = recommendations;
  }

  // Utility methods for template
  isPeriodActive(period: PeriodType): boolean {
    return this.periodType === period;
  }

  isGenderActive(gender: Gender): boolean {
    return this.gender === gender;
  }

  isActivityLevelActive(level: ActivityLevel): boolean {
    return this.activityLevel === level;
  }

  // Helper method to get activity level display name
  getActivityLevelName(level: ActivityLevel): string {
    const names = {
      sedentary: 'Sedentary',
      light: 'Light Activity',
      moderate: 'Moderate Activity',
      active: 'Active',
      very_active: 'Very Active'
    };
    return names[level];
  }
}