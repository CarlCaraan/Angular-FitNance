import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FoodListResponse } from '../../models/food/food-list-response';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/api/Food`;

  getFoods(
    pageNumber: number = 1,
    pageSize: number = 30,
    search: string = '',
  ): Observable<FoodListResponse> {
    let params = new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<FoodListResponse>(this.apiUrl, { params });
  }
}
