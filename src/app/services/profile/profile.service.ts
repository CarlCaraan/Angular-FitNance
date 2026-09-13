import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserProfile } from '../../models/profile/profile';
import { ComputeProfileRequest } from '../../models/profile/compute-profile-request';
import { ComputeProfileResponse } from '../../models/profile/compute-profile-response';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/api/Profile`;

  constructor(private http: HttpClient) {}

  getProfile(userProfileId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userProfileId}`);
  }

  computeTargets(request: ComputeProfileRequest): Observable<ComputeProfileResponse> {
    return this.http.post<ComputeProfileResponse>(`${this.apiUrl}/computeTargets`, request);
  }
}
