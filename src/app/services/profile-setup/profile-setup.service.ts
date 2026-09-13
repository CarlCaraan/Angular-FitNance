import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ProfileSetupRequest } from '../../models/profile-setup/profile-setup-request';
import { ProfileSetupResult } from '../../models/profile-setup/profile-setup-result';

@Injectable({
  providedIn: 'root',
})
export class ProfileSetupService {
  private apiUrl = `${environment.apiUrl}/api/ProfileSetup`;

  constructor(private http: HttpClient) {}

  computeProfile(request: ProfileSetupRequest): Observable<ProfileSetupResult> {
    return this.http.post<ProfileSetupResult>(`${this.apiUrl}/result`, request);
  }
}
