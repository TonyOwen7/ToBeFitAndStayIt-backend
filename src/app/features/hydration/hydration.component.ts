// hydration.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../../core/components/header/header.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { FoodDrinkService, Food, Drink } from '../../services/food-drink/food-drink.service';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../services/auth-state/auth-state.service';

interface WaterItem {
  id: number;
  name: string;
  quantity: number;
  volumePerUnit: number;
  totalVolume: number;
  type: 'water' | 'drink' | 'food';
  calories?: number;
}

interface Recommendation {
  title: string;
  text: string;
}

interface HealthIndicator {
  name: string;
  icon: string;
  status: string;
  description: string;
}


@Component({
  selector: 'app-hydration',
  imports: [CommonModule, FormsModule, HttpClientModule, HeaderComponent, FooterComponent],
  templateUrl: './hydration.component.html',
  styleUrls: ['./hydration.component.css'],
  providers: [FoodDrinkService]
})
export class HydrationComponent implements OnInit {
  waterItems: WaterItem[] = [];
  totalWater: number = 0;
  totalCalories: number = 0;
  bodyWeight: number = 0;
  gender: string = 'male';
  age: number = 0;
  activityLevel: string = 'low';
  climate: string = 'normal';
  dailyWaterGoal: number = 2000;

  // Form inputs
  drinkName: string = '';
  quantity: number | null = null;
  volumePerUnit: number | null = null;

  
  
  // Food/Drink selection
  availableFoods: Food[] = [];
  availableDrinks: Drink[] = [];
  selectedFood: Food | null = null;
  selectedDrink: Drink | null = null;
  selectedFoodQuantity: number | null = null;
  selectedDrinkQuantity: number | null = null;
  
  // UI state
  activeTab: 'water' | 'drinks' | 'foods' = 'water';
  isLoading: boolean = false;
  error: string = '';

  private authSubscription = new Subscription();

  constructor(
    private authState: AuthStateService,
    private foodDrinkService: FoodDrinkService
  ) {}

  ngOnInit(): void {
    this.authSubscription.add(
      this.authState.isLoggedIn$.subscribe(isLoggedIn => {
        this.loadFoodsAndDrinks(isLoggedIn);
      })
    );  
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  private loadFoodsAndDrinks(isLoggedIn: boolean): void {
    this.isLoading = true;
    this.error = '';

    if (isLoggedIn) {
      // Load real data when authenticated
      this.loadRealData();
    } else {
      // Use mock data when not authenticated
      this.loadMockData();
      this.isLoading = false;
    }
  }

  private loadRealData(): void {
    // Load foods from API
    this.foodDrinkService.getFoods().subscribe({
      next: (foods) => {
        this.availableFoods = foods;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading foods:', error);
        this.error = 'Failed to load foods. Using offline mode.';
        this.availableFoods = this.getMockFoods();
        this.checkLoadingComplete();
      }
    });

    // Load drinks from API
    this.foodDrinkService.getDrinks().subscribe({
      next: (drinks) => {
        this.availableDrinks = drinks;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading drinks:', error);
        this.error = 'Failed to load drinks. Using offline mode.';
        this.availableDrinks = this.getMockDrinks();
        this.checkLoadingComplete();
      }
    });
  }

  private loadMockData(): void {
    this.availableFoods = this.getMockFoods();
    this.availableDrinks = this.getMockDrinks();
  }

  private checkLoadingComplete(): void {
    if (this.availableFoods.length > 0 && this.availableDrinks.length > 0) {
      this.isLoading = false;
    }
  }

  // Mock data for offline functionality
  private getMockFoods(): Food[] {
    return [
      { id: 1, name: 'Apple', calories_per_mass: 52, mass: 100, water_percentage: 86 },
      { id: 2, name: 'Watermelon', calories_per_mass: 30, mass: 100, water_percentage: 92 },
      { id: 3, name: 'Orange', calories_per_mass: 47, mass: 100, water_percentage: 87 },
      { id: 4, name: 'Cucumber', calories_per_mass: 16, mass: 100, water_percentage: 95 },
      { id: 5, name: 'Tomato', calories_per_mass: 18, mass: 100, water_percentage: 94 },
      { id: 6, name: 'Lettuce', calories_per_mass: 15, mass: 100, water_percentage: 96 },
      { id: 7, name: 'Strawberries', calories_per_mass: 32, mass: 100, water_percentage: 91 },
      { id: 8, name: 'Peach', calories_per_mass: 39, mass: 100, water_percentage: 89 }
    ];
  }

  private getMockDrinks(): Drink[] {
    return [
      { id: 1, name: 'Pure Water', calories_per_volume: 0, volume: 250 },
      { id: 2, name: 'Green Tea', calories_per_volume: 2, volume: 250 },
      { id: 3, name: 'Black Coffee', calories_per_volume: 5, volume: 250 },
      { id: 4, name: 'Orange Juice', calories_per_volume: 112, volume: 250 },
      { id: 5, name: 'Apple Juice', calories_per_volume: 117, volume: 250 },
      { id: 6, name: 'Sports Drink', calories_per_volume: 50, volume: 250 },
      { id: 7, name: 'Coconut Water', calories_per_volume: 46, volume: 250 },
      { id: 8, name: 'Herbal Tea', calories_per_volume: 0, volume: 250 }
    ];
  }

  get roundedPercentage(): number {
    return Math.round(this.progressPercentage);
  }

  setActiveTab(tab: 'water' | 'drinks' | 'foods'): void {
    this.activeTab = tab;
    this.clearAllInputs();
  }

  // Quick add functions
  quickAdd(amount: number): void {
    const drinkItem: WaterItem = {
      id: Date.now(),
      name: 'Pure Water',
      quantity: 1,
      volumePerUnit: amount,
      totalVolume: amount,
      type: 'water'
    };

    this.waterItems.push(drinkItem);
    this.totalWater += amount;
  }

  // Manual water entry
  addWater(): void {
    if (!this.drinkName || !this.quantity || !this.volumePerUnit) {
      this.showError('Please fill in all fields');
      return;
    }

    const totalVolume = this.quantity * this.volumePerUnit;
    const drinkItem: WaterItem = {
      id: Date.now(),
      name: this.drinkName,
      quantity: this.quantity,
      volumePerUnit: this.volumePerUnit,
      totalVolume: totalVolume,
      type: 'water'
    };

    this.waterItems.push(drinkItem);
    this.totalWater += totalVolume;
    this.clearWaterInputs();
  }

  // Add selected drink
  addSelectedDrink(): void {
    if (!this.selectedDrink || !this.selectedDrinkQuantity) {
      this.showError('Please select a drink and specify quantity');
      return;
    }

    const totalVolume = this.selectedDrinkQuantity * this.selectedDrink.volume;
    const totalCalories = this.selectedDrinkQuantity * this.selectedDrink.calories_per_volume;
    
    const drinkItem: WaterItem = {
      id: Date.now(),
      name: this.selectedDrink.name,
      quantity: this.selectedDrinkQuantity,
      volumePerUnit: this.selectedDrink.volume,
      totalVolume: totalVolume,
      type: 'drink',
      calories: totalCalories
    };

    this.waterItems.push(drinkItem);
    this.totalWater += totalVolume;
    this.totalCalories += totalCalories;
    this.clearDrinkInputs();
  }

  // Add selected food
  addSelectedFood(): void {
    if (!this.selectedFood || !this.selectedFoodQuantity) {
      this.showError('Please select a food and specify quantity');
      return;
    }

    const totalMass = this.selectedFoodQuantity * this.selectedFood.mass;
    const waterContent = (totalMass * this.selectedFood.water_percentage) / 100;
    const totalCalories = this.selectedFoodQuantity * this.selectedFood.calories_per_mass;
    
    const foodItem: WaterItem = {
      id: Date.now(),
      name: this.selectedFood.name,
      quantity: this.selectedFoodQuantity,
      volumePerUnit: waterContent,
      totalVolume: waterContent,
      type: 'food',
      calories: totalCalories
    };

    this.waterItems.push(foodItem);
    this.totalWater += waterContent;
    this.totalCalories += totalCalories;
    this.clearFoodInputs();
  }

  // Remove item
  removeItem(id: number): void {
    const item = this.waterItems.find(item => item.id === id);
    if (item) {
      this.totalWater -= item.totalVolume;
      if (item.calories) {
        this.totalCalories -= item.calories;
      }
      this.waterItems = this.waterItems.filter(item => item.id !== id);
    }
  }

  // Clear input functions
  private clearAllInputs(): void {
    this.clearWaterInputs();
    this.clearDrinkInputs();
    this.clearFoodInputs();
  }

  private clearWaterInputs(): void {
    this.drinkName = '';
    this.quantity = null;
    this.volumePerUnit = null;
  }

  private clearDrinkInputs(): void {
    this.selectedDrink = null;
    this.selectedDrinkQuantity = null;
  }

  private clearFoodInputs(): void {
    this.selectedFood = null;
    this.selectedFoodQuantity = null;
  }

  private showError(message: string): void {
    this.error = message;
    setTimeout(() => this.error = '', 3000);
  }

  // Goal calculation functions
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
      let baseWater: number;
      
      if (this.gender === 'male') {
        baseWater = this.bodyWeight * 37;
      } else {
        baseWater = this.bodyWeight * 31;
      }

      if (this.age > 65) {
        baseWater *= 1.1;
      } else if (this.age > 0 && this.age < 18) {
        baseWater *= 1.15;
      }
      
      const activityMultipliers: { [key: string]: number } = {
        'low': 1.0,
        'moderate': this.gender === 'male' ? 1.2 : 1.15,
        'high': this.gender === 'male' ? 1.4 : 1.3,
        'intense': this.gender === 'male' ? 1.6 : 1.5
      };
      
      const climateMultipliers: { [key: string]: number } = {
        'normal': 1.0,
        'hot': this.gender === 'male' ? 1.3 : 1.25,
        'cold': 0.95
      };
      
      this.dailyWaterGoal = Math.round(
        baseWater * 
        activityMultipliers[this.activityLevel] * 
        climateMultipliers[this.climate]
      );
      
      if (this.gender === 'male') {
        this.dailyWaterGoal = Math.max(2000, Math.min(4500, this.dailyWaterGoal));
      } else {
        this.dailyWaterGoal = Math.max(1600, Math.min(3500, this.dailyWaterGoal));
      }
    }
  }

  // Progress calculations
  get progressPercentage(): number {
    if (this.dailyWaterGoal > 0) {
      return Math.min((this.totalWater / this.dailyWaterGoal) * 100);
    }
    return 0;
  }

  get remainingWater(): number {
    return Math.max(0, this.dailyWaterGoal - this.totalWater);
  }

  get hydrationStatus(): { color: string; text: string; isOver: boolean } {
    const percentage = this.progressPercentage;
    
    if (percentage < 25) {
      return { color: '#f44336', text: 'Dehydrated', isOver: false };
    } else if (percentage < 50) {
      return { color: '#ff9800', text: 'Low Hydration', isOver: false };
    } else if (percentage < 75) {
      return { color: '#ffc107', text: 'Fair Hydration', isOver: false };
    } else if (percentage < 100) {
      return { color: '#4caf50', text: 'Well Hydrated', isOver: false };
    } else if (percentage >= 120){
      return { color: '#9c27b0', text: 'Overhydrated!', isOver: true };
    }
    else {
      return { color: '#9c27b0', text: 'Overhydrated!', isOver: true };
    }
  }

  // Add method to calculate overhydration amount
get overhydrationAmount(): number {
  if (this.totalWater > this.dailyWaterGoal) {
    return this.totalWater - this.dailyWaterGoal;
  }
  return 0;
}

// Add method for overhydration warnings
get overhydrationWarnings(): string[] {
  const warnings = [];
  const percentage = this.progressPercentage;
  
  if (percentage > 120) {
    warnings.push('Hyponatremia risk: Dangerously low sodium levels');
    warnings.push('Potential for water intoxication');
    warnings.push('Kidney stress from processing excess water');
  } else if (percentage > 100) {
    warnings.push('Electrolyte imbalance possible');
    warnings.push('Frequent urination disrupting daily activities');
    warnings.push('Potential for disrupted sleep from nighttime bathroom trips');
  }
  
  return warnings;
}



  // Recommendations
  get recommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (this.bodyWeight && this.dailyWaterGoal) {
      const percentage = this.progressPercentage;
      const remaining = this.remainingWater;

      if (percentage < 25) {
        recommendations.push({
          title: "Drink More Water",
          text: `You're behind on your hydration goals. Try to drink ${Math.round(remaining)}mL more today.`
        });
      } else if (percentage < 50) {
        recommendations.push({
          title: "Stay on Track",
          text: `You need ${Math.round(remaining)}mL more to reach your daily goal. Consider water-rich foods too.`
        });
      } else if (percentage < 100) {
        recommendations.push({
          title: "Almost There!",
          text: `Great progress! Only ${Math.round(remaining)}mL left to complete your hydration goal.`
        });
      } else {
        recommendations.push({
          title: "Goal Achieved!",
          text: "Perfect! You've reached your daily hydration goal. Keep maintaining this level."
        });
      }

      // Nutritional recommendations
      if (this.totalCalories > 0) {
        recommendations.push({
          title: "Caloric Intake",
          text: `You've consumed ${Math.round(this.totalCalories)} calories from drinks and foods today.`
        });
      }

      // Recommendations based on item types
      const foodItems = this.waterItems.filter(item => item.type === 'food').length;
      const drinkItems = this.waterItems.filter(item => item.type === 'drink').length;
      
      if (foodItems > 0) {
        recommendations.push({
          title: "Food-Based Hydration",
          text: "Excellent! Water-rich foods contribute significantly to hydration. Keep including fruits and vegetables."
        });
      }

      if (drinkItems > 0) {
        recommendations.push({
          title: "Beverage Variety",
          text: "You're varying your hydration sources. Be mindful of sugary or caffeinated drinks in large quantities."
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

  // Helper functions for template
  onFoodChange(event: any): void {
    const foodId = parseInt(event.target.value);
    this.selectedFood = this.availableFoods.find(food => food.id === foodId) || null;
  }

  onDrinkChange(event: any): void {
    const drinkId = parseInt(event.target.value);
    this.selectedDrink = this.availableDrinks.find(drink => drink.id === drinkId) || null;
  }

  getItemTypeIcon(type: string): string {
    switch (type) {
      case 'water': return '💧';
      case 'drink': return '🥤';
      case 'food': return '🍎';
      default: return '💧';
    }
  }

  getItemTypeColor(type: string): string {
    switch (type) {
      case 'water': return '#42a5f5';
      case 'drink': return '#ff9800';
      case 'food': return '#4caf50';
      default: return '#42a5f5';
    }
  }

// Add this method to the component class
getHealthInsights(): HealthIndicator[] {
  const percentage = this.progressPercentage;
  const insights: HealthIndicator[] = [];

  // Urine Color
  if (percentage < 25) {
    insights.push({ 
      name: 'Urine Color', 
      icon: '💧', 
      status: 'Dark Amber/Brown', 
      description: 'Indicates severe dehydration. Your kidneys are conserving water.' 
    });
  } else if (percentage < 50) {
    insights.push({ 
      name: 'Urine Color', 
      icon: '💧', 
      status: 'Dark Yellow', 
      description: 'Significant dehydration. Your body needs more fluids.' 
    });
  } else if (percentage < 75) {
    insights.push({ 
      name: 'Urine Color', 
      icon: '💧', 
      status: 'Light Yellow', 
      description: 'Mild dehydration. Aim for pale yellow urine.' 
    });
  } else if (percentage < 100) {
    insights.push({ 
      name: 'Urine Color', 
      icon: '💧', 
      status: 'Pale Yellow', 
      description: 'Ideal hydration level. Keep maintaining this!' 
    });
  } else {
    insights.push({ 
      name: 'Urine Color', 
      icon: '💧', 
      status: 'Clear', 
      description: 'Overhydration risk. Too clear indicates diluted electrolytes.' 
    });
  }

  // Energy Level
  if (percentage < 30) {
    insights.push({ 
      name: 'Energy Level', 
      icon: '⚡', 
      status: 'Very Low', 
      description: 'Dehydration causes fatigue as cells aren\'t getting enough fluid.' 
    });
  } else if (percentage < 60) {
    insights.push({ 
      name: 'Energy Level', 
      icon: '⚡', 
      status: 'Low', 
      description: 'Mild dehydration reduces blood volume, making your heart work harder.' 
    });
  } else if (percentage < 90) {
    insights.push({ 
      name: 'Energy Level', 
      icon: '⚡', 
      status: 'Normal', 
      description: 'Proper hydration supports optimal cellular energy production.' 
    });
  } else if (percentage < 110) {
    insights.push({ 
      name: 'Energy Level', 
      icon: '⚡', 
      status: 'Good', 
      description: 'Well-hydrated cells provide steady energy throughout the day.' 
    });
  } else {
    insights.push({ 
      name: 'Energy Level', 
      icon: '⚡', 
      status: 'Sluggish', 
      description: 'Overhydration dilutes electrolytes, causing fatigue and weakness.' 
    });
  }

  // Sleep Quality
  if (percentage < 40) {
    insights.push({ 
      name: 'Sleep Quality', 
      icon: '😴', 
      status: 'Poor', 
      description: 'Dehydration causes muscle cramps and restless sleep.' 
    });
  } else if (percentage < 70) {
    insights.push({ 
      name: 'Sleep Quality', 
      icon: '😴', 
      status: 'Fair', 
      description: 'Mild dehydration may cause nighttime awakenings.' 
    });
  } else if (percentage < 100) {
    insights.push({ 
      name: 'Sleep Quality', 
      icon: '😴', 
      status: 'Good', 
      description: 'Proper hydration supports natural sleep cycles.' 
    });
  } else {
    insights.push({ 
      name: 'Sleep Quality', 
      icon: '😴', 
      status: 'Disrupted', 
      description: 'Overhydration causes frequent nighttime bathroom trips.' 
    });
  }

  // Nutrition & Hunger
  if (percentage < 30) {
    insights.push({ 
      name: 'Nutrition & Hunger', 
      icon: '🍽️', 
      status: 'Increased Hunger', 
      description: 'Dehydration is often mistaken for hunger, leading to overeating.' 
    });
  } else if (percentage < 60) {
    insights.push({ 
      name: 'Nutrition & Hunger', 
      icon: '🍽️', 
      status: 'Cravings', 
      description: 'Mild dehydration impairs nutrient absorption and increases cravings.' 
    });
  } else if (percentage < 100) {
    insights.push({ 
      name: 'Nutrition & Hunger', 
      icon: '🍽️', 
      status: 'Balanced', 
      description: 'Proper hydration supports metabolism and nutrient utilization.' 
    });
  } else {
    insights.push({ 
      name: 'Nutrition & Hunger', 
      icon: '🍽️', 
      status: 'Reduced Appetite', 
      description: 'Overhydration creates false fullness, reducing nutrient intake.' 
    });
  }

  // Health Risks
  if (percentage < 30) {
    insights.push({ 
      name: 'Health Risks', 
      icon: '⚠️', 
      status: 'High', 
      description: 'Risk of kidney stones, urinary infections, and heat exhaustion.' 
    });
  } else if (percentage < 60) {
    insights.push({ 
      name: 'Health Risks', 
      icon: '⚠️', 
      status: 'Moderate', 
      description: 'Increased risk of constipation and impaired cognitive function.' 
    });
  } else if (percentage < 100) {
    insights.push({ 
      name: 'Health Risks', 
      icon: '⚠️', 
      status: 'Low', 
      description: 'Optimal hydration supports all bodily functions.' 
    });
  } else {
    insights.push({ 
      name: 'Health Risks', 
      icon: '⚠️', 
      status: 'Hyponatremia Risk', 
      description: 'Dangerously low sodium levels causing nausea, headaches, confusion.' 
    });
  }

  return insights;
}

}