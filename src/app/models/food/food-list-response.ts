import { MasterFood } from './master-food';

export interface FoodListResponse {
  items: MasterFood[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
