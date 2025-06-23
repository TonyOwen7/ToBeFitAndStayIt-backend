
export interface RegisterFormState {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    age: number | null;
    gender: string;
    password: string;
    confirmPassword: string;
    activityLevel: string;
    healthGoal: string;
    climate: string;
    weight: number | null;
    height: number | null;
    agreeTerms: boolean;
    passwordVisible: boolean;
    confirmPasswordVisible: boolean;
    errorMessage: string;
  }