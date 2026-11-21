import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MealPlanListResponse, MealPlanRequest } from '../../models/meal-plan/meal-plan';

@Injectable({ providedIn: 'root' })
export class MealPlanService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/MealPlan`;

  list(pageNumber: number, pageSize: number, search: string) {
    return this.http.get<MealPlanListResponse>(this.url, { params: { pageNumber, pageSize, search } });
  }

  get(id: string) {
    return this.http.get<MealPlanRequest>(`${this.url}/${encodeURIComponent(id)}`);
  }

  save(plan: MealPlanRequest, id?: string) {
    return id
      ? this.http.put<void>(`${this.url}/${encodeURIComponent(id)}`, plan)
      : this.http.post<void>(this.url, plan);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(id)}`);
  }
}
