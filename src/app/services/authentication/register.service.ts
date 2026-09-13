// Ginagamit ang Injectable para gawing injectable/service ang class na ito.
// Ibig sabihin, puwede natin itong gamitin sa ibang component gaya ng Register component.
import { Injectable } from '@angular/core';

// HttpClient ang ginagamit para makapagpadala ng HTTP request sa ASP.NET Core API.
import { HttpClient } from '@angular/common/http';

// Observable ang ginagamit para makatanggap ng asynchronous response mula sa API.
import { Observable } from 'rxjs';

// Ito ang interface/model na naglalaman ng data na ipapadala natin sa Register API.
import { RegisterRequest } from '../../models/authentication/register-request';

// Kinukuha natin ang API URL mula sa environment.ts
// para hindi natin kailangang i-hardcode ang https://localhost:7114 sa service.
import { environment } from '../../../environments/environment';
import { RegisterResponse } from '../../models/authentication/register-response';

@Injectable({
  // Ibig sabihin, isang instance lang ng RegisterService ang gagawin
  // at puwede itong gamitin sa buong Angular application.
  providedIn: 'root',
})
export class RegisterService {
  // Base URL ng ASP.NET Core API.
  //
  // Halimbawa:
  // environment.apiUrl = https://localhost:7114
  //
  // Kaya ang magiging apiUrl ay:
  // https://localhost:7114/api/Auth
  private readonly apiUrl = `${environment.apiUrl}/api/Auth`;

  // Dito natin tinatanggap ang HttpClient.
  // Angular ang bahalang gumawa/provide nito para magamit natin
  // sa paggawa ng HTTP requests.
  constructor(private http: HttpClient) {}

  // Method na tatawagin ng Register component kapag nag-register ang user.
  //
  // request = data ng registration
  //
  // Halimbawa:
  // {
  //   lastName: 'Dela Cruz',
  //   firstName: 'Juan',
  //   username: 'juan123',
  //   password: '12345678',
  //   confirmPassword: '12345678'
  // }
  //
  // Observable<RegisterResponse> = inaasahan nating may response na babalik mula sa API.
  register(request: RegisterRequest): Observable<RegisterResponse> {
    // Nagpapadala tayo ng HTTP POST request sa Register API.
    //
    // this.apiUrl = https://localhost:7114/api/Auth
    //
    // /register = endpoint ng ASP.NET Core
    //
    // request = data na ipapadala natin sa backend
    //
    // Kaya magiging:
    //
    // POST https://localhost:7114/api/Auth/register
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, request);
  }
}
