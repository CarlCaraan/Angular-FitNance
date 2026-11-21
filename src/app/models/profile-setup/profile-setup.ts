export interface ProfileSetupRequest {
  birthDate: string;
  gender: string;
  height: number;
  weight: number;
  activityLevelId: string;
  goalId: string;
}

export interface ProfileSetupResult {
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmr: number;
  activityFactor: number;
  tdee: number;
  fitnessGoalId: string;
  calorieAdjustment: number;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  activityLevelName: string;
  goalName: string;
}

export interface CompleteProfileRequest {
  birthdate: string;
  age: number;
  gender: string;

  height: number;
  weight: number;
  currentBMI: number;

  activityLevelId: string;
  fitnessGoalId: string;

  monthlyIncome: number;
  savingsGoal: number;
  currentSavings: number;

  bmr: number;
  tdee: number;

  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;

  firstName: string;
  middleName: string;
  lastName: string;

  themeMode: string;
  primaryColor: string;
  secondaryColor: string;
  primaryFontColor: string;
  secondaryFontColor: string;
  accentColor: string;
}

export interface CompleteProfileResponse {
  message: string;
  username: string;
  isProfileComplete: boolean;
}
