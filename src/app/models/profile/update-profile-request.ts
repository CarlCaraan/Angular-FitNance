export interface UpdateProfileRequest {
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

  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;

  firstName: string;
  middleName: string;
  lastName: string;
}
