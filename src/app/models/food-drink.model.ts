// food.model.ts
export interface Food {
    id: number;
    name: string;
    calories_per_mass: number;
    mass: number;
    water_percentage: number;
  }
  
  // drink.model.ts
  export interface Drink {
    id: number;
    name: string;
    calories_per_volume: number;
    volume: number;
  }
  