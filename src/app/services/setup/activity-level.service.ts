import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ActivityLevel } from '../../models/setup/activity-level';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityLevelService {
  private readonly apiUrl = `${environment.apiUrl}/api/ActivityLevel`;

  constructor(private http: HttpClient) {}

  getActivityLevels(): Observable<ActivityLevel[]> {
    return this.http.get<ActivityLevel[]>(this.apiUrl);
  }
}
