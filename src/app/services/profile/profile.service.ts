import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  UserProfile,
  ComputeProfileRequest,
  ComputeProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '../../models/profile/profile';

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

  updateProfile(
    userProfileId: string,
    request: UpdateProfileRequest,
  ): Observable<UpdateProfileResponse> {
    return this.http.put<UpdateProfileResponse>(`${this.apiUrl}/${userProfileId}`, request);
  }
}
