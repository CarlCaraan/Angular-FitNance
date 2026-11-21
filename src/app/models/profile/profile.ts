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

export interface ComputeProfileRequest {
  birthDate: string;
  gender: string;
  height: number;
  weight: number;
  activityLevelId: string;
  goalId: string;
}

export interface ComputeProfileResponse {
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

export interface UpdateProfileResponse {
  message: string;
  userProfileId: string;
}
