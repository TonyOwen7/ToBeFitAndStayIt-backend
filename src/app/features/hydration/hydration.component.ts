// water-tracker.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

interface WaterItem {
  id: number;
  name: string;
  quantity: number;
  volumePerUnit: number;
  totalVolume: number;
}

interface Recommendation {
  title: string;
  text: string;
}

@Component({
  selector: 'app-hydration',
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './hydration.component.html',
  styleUrls: ['./hydration.component.css']
})
export class HydrationComponent {
  waterItems: WaterItem[] = [];
  totalWater: number = 0;
  bodyWeight: number = 0;
  gender: string = 'male'; // New gender property
  age: number = 0; // Optional: age can also affect hydration needs
  activityLevel: string = 'low';
  climate: string = 'normal';
  dailyWaterGoal: number = 2000;

  // Form inputs
  drinkName: string = '';
  quantity: number | null = null;
  volumePerUnit: number | null = null;

  get roundedPercentage(): number {
    return Math.round(this.progressPercentage);
  }

  quickAdd(amount: number): void {
    const drinkItem: WaterItem = {
      id: Date.now(),
      name: 'Quick Add',
      quantity: 1,
      volumePerUnit: amount,
      totalVolume: amount
    };

    this.waterItems.push(drinkItem);
    this.totalWater += amount;
    this.updateWaterDisplay();
  }

  addDrink(): void {
    if (!this.drinkName || !this.quantity || !this.volumePerUnit) {
      alert('Please fill in all fields');
      return;
    }

    const totalVolume = this.quantity * this.volumePerUnit;
    const drinkItem: WaterItem = {
      id: Date.now(),
      name: this.drinkName,
      quantity: this.quantity,
      volumePerUnit: this.volumePerUnit,
      totalVolume: totalVolume
    };

    this.waterItems.push(drinkItem);
    this.totalWater += totalVolume;
    this.updateWaterDisplay();
    this.clearInputs();
  }

  removeDrink(id: number): void {
    const item = this.waterItems.find(item => item.id === id);
    if (item) {
      this.totalWater -= item.totalVolume;
      this.waterItems = this.waterItems.filter(item => item.id !== id);
      this.updateWaterDisplay();
    }
  }

  private updateWaterDisplay(): void {
    // This method is called whenever water data changes
    // Angular's change detection will handle UI updates automatically
  }

  private clearInputs(): void {
    this.drinkName = '';
    this.quantity = null;
    this.volumePerUnit = null;
  }

  setActivity(level: string): void {
    this.activityLevel = level;
    this.calculateGoal();
  }

  setGender(selectedGender: string): void {
    this.gender = selectedGender;
    this.calculateGoal();
  }

  calculateGoal(): void {
    if (this.bodyWeight > 0) {
      // Gender-based base water calculation
      let baseWater: number;
      
      if (this.gender === 'male') {
        // Males: Higher base requirement due to higher muscle mass and metabolism
        baseWater = this.bodyWeight * 37; // 37mL per kg for males
      } else {
        // Females: Slightly lower base requirement
        baseWater = this.bodyWeight * 31; // 31mL per kg for females
      }

      // Age adjustment (optional - older adults may need slightly more)
      if (this.age > 65) {
        baseWater *= 1.1; // 10% increase for seniors
      } else if (this.age > 0 && this.age < 18) {
        baseWater *= 1.15; // 15% increase for children/teens due to higher turnover
      }
      
      // Activity level multiplier
      const activityMultipliers: { [key: string]: number } = {
        'low': 1.0,
        'moderate': this.gender === 'male' ? 1.2 : 1.15, // Males need slightly more during exercise
        'high': this.gender === 'male' ? 1.4 : 1.3,
        'intense': this.gender === 'male' ? 1.6 : 1.5
      };
      
      // Climate multiplier
      const climateMultipliers: { [key: string]: number } = {
        'normal': 1.0,
        'hot': this.gender === 'male' ? 1.3 : 1.25, // Males tend to sweat more
        'cold': 0.95 // Slightly reduced in cold weather
      };
      
      this.dailyWaterGoal = Math.round(
        baseWater * 
        activityMultipliers[this.activityLevel] * 
        climateMultipliers[this.climate]
      );
      
      // Gender-specific limits
      if (this.gender === 'male') {
        // Males: 2L to 4.5L
        this.dailyWaterGoal = Math.max(2000, Math.min(4500, this.dailyWaterGoal));
      } else {
        // Females: 1.6L to 3.5L
        this.dailyWaterGoal = Math.max(1600, Math.min(3500, this.dailyWaterGoal));
      }
    }
  }

  get progressPercentage(): number {
    if (this.dailyWaterGoal > 0) {
      return Math.min((this.totalWater / this.dailyWaterGoal) * 100, 100);
    }
    return 0;
  }

  get remainingWater(): number {
    return Math.max(0, this.dailyWaterGoal - this.totalWater);
  }

  get hydrationStatus(): { color: string; text: string } {
    const percentage = this.progressPercentage;
    
    if (percentage < 25) {
      return { color: '#f44336', text: 'Dehydrated' };
    } else if (percentage < 50) {
      return { color: '#ff9800', text: 'Low Hydration' };
    } else if (percentage < 75) {
      return { color: '#ffc107', text: 'Fair Hydration' };
    } else if (percentage < 100) {
      return { color: '#4caf50', text: 'Well Hydrated' };
    } else {
      return { color: '#2196f3', text: 'Excellent!' };
    }
  }

  get recommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (this.bodyWeight && this.dailyWaterGoal) {
      const percentage = this.progressPercentage;
      const remaining = this.remainingWater;

      if (percentage < 25) {
        recommendations.push({
          title: "Drink More Water",
          text: `You're significantly behind on your hydration goals. Try to drink ${remaining}mL more today. Consider setting hourly reminders.`
        });
      } else if (percentage < 50) {
        recommendations.push({
          title: "Stay on Track",
          text: `You need ${remaining}mL more to reach your daily goal. Try having a glass of water with each meal.`
        });
      } else if (percentage < 100) {
        recommendations.push({
          title: "Almost There!",
          text: `Great progress! You only need ${remaining}mL more to complete your hydration goal for today.`
        });
      } else {
        recommendations.push({
          title: "Goal Achieved!",
          text: "Excellent! You've met your daily hydration goal. Maintain this level throughout the day."
        });
      }

      // Gender-specific recommendations
      if (this.gender === 'female') {
        recommendations.push({
          title: "Female Hydration Tip",
          text: "Women's hydration needs can vary during menstruation, pregnancy, or breastfeeding. Consider increasing intake during these times."
        });
      } else {
        recommendations.push({
          title: "Male Hydration Tip",
          text: "Men typically have higher muscle mass and may need more water, especially when strength training or in hot climates."
        });
      }

      // Activity-based recommendations
      if (this.activityLevel === 'high' || this.activityLevel === 'intense') {
        const genderTip = this.gender === 'male' 
          ? "Males typically lose more fluids through sweat during intense exercise."
          : "Focus on consistent hydration before, during, and after workouts.";
        
        recommendations.push({
          title: "High Activity Level",
          text: `With your high activity level, remember to drink water before, during, and after exercise. ${genderTip}`
        });
      }

      // Climate-based recommendations
      if (this.climate === 'hot') {
        recommendations.push({
          title: "Hot Climate Alert",
          text: "In hot weather, increase your water intake and avoid prolonged sun exposure. Consider electrolyte drinks for extended outdoor activities."
        });
      }

      // General hydration tips
      if (this.waterItems.length === 0) {
        recommendations.push({
          title: "Start Your Day Right",
          text: "Begin your day with a glass of water to kickstart your hydration. Keep a water bottle nearby as a visual reminder."
        });
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Get Started",
        text: "Enter your weight, gender, and activity level to receive personalized hydration recommendations."
      });
    }

    return recommendations;
  }
}