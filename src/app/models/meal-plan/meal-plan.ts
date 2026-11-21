export interface MealPlanSummary {
  mealPlanId: string;
  planName: string;
  startDate: string | null;
  endDate: string | null;
  totalCalories: number | null;
  totalProtein: number | null;
  totalCarbs: number | null;
  totalFat: number | null;
  itemCount: number;
}

export interface MealPlanItem {
  mealPlanDetailId?: string;
  foodId: string;
  foodName?: string;
  mealType: string;
  mealDate: string | null;
  quantity: number | null;
  calories?: number | null;
}

export interface MealPlanListResponse {
  items: MealPlanSummary[];
  totalCount: number;
  pageNumber: number;
}

export interface MealPlanRequest {
  planName: string;
  startDate: string | null;
  endDate: string | null;
  details: MealPlanItem[];
}
