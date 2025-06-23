
export interface UserProfile {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  
    // Water needs related fields
    weight?: number;
    height?: number;
    gender?: 'male' | 'female' | string ;
    age?: number;
    activityLevel?: 
      'sedentary' |
      'light' |
      'moderate' |
      'active' |
      'very-active' | string;
    healthGoal?: 
      'weight-loss' |
      'maintain-weight' |
      'weight-gain' |
      'general-health' | string;
    wantsNewsletter?: boolean;
  
    climate?: string;
    dailyWaterGoal?: number;
  }