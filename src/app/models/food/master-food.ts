export interface MasterFood {
  foodId: string;
  foodName: string;
  category: string | null;
  servingSize: number | null;
  servingUnit: string | null;
  servingGrams: number | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sodium: number | null;
  sugar: number | null;
  cholesterol: number | null;
  isCanned: boolean | null;
  isFastFood: boolean | null;
  createdBy: string | null;
  createdDate: string | null;
  modifiedBy: string | null;
  modifiedDate: string | null;
  userId: string | null;
  rowstamp: number;
}
