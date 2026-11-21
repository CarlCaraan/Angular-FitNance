import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CompleteProfileRequest,
  CompleteProfileResponse,
} from '../../models/profile-setup/profile-setup';

@Injectable({
  providedIn: 'root',
})
export class CompleteProfileService {
  private apiUrl = `${environment.apiUrl}/api/ProfileSetup`;

  constructor(private http: HttpClient) {}

  completeProfile(request: CompleteProfileRequest): Observable<CompleteProfileResponse> {
    return this.http.post<CompleteProfileResponse>(`${this.apiUrl}/complete`, request);
  }
}
