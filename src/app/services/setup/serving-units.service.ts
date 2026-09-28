import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServingUnits } from '../../models/setup/serving-units';

@Injectable({
  providedIn: 'root',
})
export class ServingUnitsService {
  private readonly apiUrl = `${environment.apiUrl}/api/ServingUnits`;

  constructor(private http: HttpClient) {}

  getServingUnits(): Observable<ServingUnits[]> {
    return this.http.get<ServingUnits[]>(this.apiUrl);
  }
}
