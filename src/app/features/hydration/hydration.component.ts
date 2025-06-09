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

  calculateGoal(): void {
    if (this.bodyWeight > 0) {
      // Base water need: 35mL per kg of body weight
      let baseWater = this.bodyWeight * 35;
      
      // Activity level multiplier
      const activityMultipliers: { [key: string]: number } = {
        'low': 1.0,
        'moderate': 1.2,
        'high': 1.4,
        'intense': 1.6
      };
      
      // Climate multiplier
      const climateMultipliers: { [key: string]: number } = {
        'normal': 1.0,
        'hot': 1.3,
        'cold': 0.9
      };
      
      this.dailyWaterGoal = Math.round(baseWater * activityMultipliers[this.activityLevel] * climateMultipliers[this.climate]);
      
      // Ensure reasonable limits (1.5L to 4L)
      this.dailyWaterGoal = Math.max(1500, Math.min(4000, this.dailyWaterGoal));
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

      // Activity-based recommendations
      if (this.activityLevel === 'high' || this.activityLevel === 'intense') {
        recommendations.push({
          title: "High Activity Level",
          text: "With your high activity level, remember to drink water before, during, and after exercise to replace fluids lost through sweat."
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
        text: "Enter your weight and activity level to receive personalized hydration recommendations."
      });
    }

    return recommendations;
  }
}