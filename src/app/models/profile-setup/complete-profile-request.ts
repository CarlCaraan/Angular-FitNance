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
