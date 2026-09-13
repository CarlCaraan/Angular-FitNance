import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NutritionGoals } from '../../models/setup/nutrition-goals';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NutritionGoalsService {
  private readonly apiUrl = `${environment.apiUrl}/api/NutritionGoals`;

  constructor(private http: HttpClient) {}

  getNutritionGoals(): Observable<NutritionGoals[]> {
    return this.http.get<NutritionGoals[]>(this.apiUrl);
  }
}
