export interface AddFoodRequest {
  foodName: string;
  category?: string;
  servingSize?: number | null;
  servingUnit?: string;
  servingGrams?: number | null;
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  fiber?: number | null;
  sodium?: number | null;
  sugar?: number | null;
  cholesterol?: number | null;
  isCanned?: boolean;
  isFastFood?: boolean;
}
