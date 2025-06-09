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

  // Weight and goal properties
  currentWeight: number = 0;
  targetWeight: number | null = null;
  timePeriod: number | null = null;
  periodType: PeriodType = 'weeks';
  dailyCalorieTarget: number = 2000; // Default maintenance calories

  // UI state properties
  recommendations: Recommendation[] = [];

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

  // Period and goal management
  setPeriod(type: PeriodType): void {
    this.periodType = type;
    this.calculateGoal();
  }

  updateCurrentWeight(): void {
    this.calculateGoal();
  }

  calculateGoal(): void {
    if (this.currentWeight && this.targetWeight && this.timePeriod) {
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
      
      // Base metabolic rate estimate (simplified)
      const baseBMR = this.currentWeight * 24; // Very rough estimate
      this.dailyCalorieTarget = Math.round(baseBMR + dailyCalorieChange);
      
      // Ensure reasonable limits
      this.dailyCalorieTarget = Math.max(1200, Math.min(4000, this.dailyCalorieTarget));
      
      this.updateRecommendations();
    }
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

  // Recommendations logic
  updateRecommendations(): void {
    const recommendations: Recommendation[] = [];

    if (this.currentWeight && this.targetWeight && this.dailyCalorieTarget) {
      const weightDifference = this.targetWeight - this.currentWeight;
      const remaining = this.remainingCalories;

      if (weightDifference > 0) {
        recommendations.push({
          title: "Weight Gain Goal",
          text: `You're aiming to gain ${Math.abs(weightDifference).toFixed(1)} kg. Focus on nutrient-dense, calorie-rich foods.`
        });
      } else if (weightDifference < 0) {
        recommendations.push({
          title: "Weight Loss Goal",
          text: `You're aiming to lose ${Math.abs(weightDifference).toFixed(1)} kg. Create a moderate calorie deficit with balanced nutrition.`
        });
      }

      if (remaining > 0) {
        recommendations.push({
          title: "Calories Remaining Today",
          text: `You have ${remaining} calories left for today. Consider adding some healthy snacks or a balanced meal.`
        });
      } else if (remaining < 0) {
        recommendations.push({
          title: "Daily Target Exceeded",
          text: `You've exceeded your daily target by ${Math.abs(remaining)} calories. Consider lighter options for remaining meals.`
        });
      }

      if (this.totalCalories < 1200) {
        recommendations.push({
          title: "Low Calorie Intake",
          text: "Make sure you're eating enough to meet your nutritional needs. Very low calorie intake can be harmful."
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Get Started",
        text: "Enter your current weight and weight goal to receive personalized recommendations for your calorie intake."
      });
    }

    this.recommendations = recommendations;
  }

  // Utility methods for template
  isPeriodActive(period: PeriodType): boolean {
    return this.periodType === period;
  }
}