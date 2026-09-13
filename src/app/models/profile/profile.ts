export interface UserProfile {
  userProfileId: string;

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

  createdBy: string;
  createdDate: string;

  modifiedBy: string | null;
  modifiedDate: string | null;

  firstName: string;
  middleName: string;
  lastName: string;
}
