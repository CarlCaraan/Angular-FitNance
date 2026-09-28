import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoodCategories } from '../../models/setup/food-categories';

@Injectable({
  providedIn: 'root',
})
export class FoodCategoriesService {
  private readonly apiUrl = `${environment.apiUrl}/api/FoodCategories`;

  constructor(private http: HttpClient) {}

  getFoodCategories(): Observable<FoodCategories[]> {
    return this.http.get<FoodCategories[]>(this.apiUrl);
  }
}
