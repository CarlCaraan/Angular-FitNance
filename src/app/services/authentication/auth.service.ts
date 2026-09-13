import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Key/name na gagamitin natin kapag sine-save
  // ang JWT token sa browser.
  private readonly tokenKey = 'fitnance_token';
  private readonly usernameKey = 'username';

  // ==========================================
  // SAVE TOKEN
  // ==========================================
  // Tatawagin ito pagkatapos successful ang login.
  //
  // Example:
  // authService.setToken(response.token);
  //
  // Ang token ay mase-save sa browser localStorage.
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // ==========================================
  // GET TOKEN
  // ==========================================
  // Kinukuha ang JWT token na naka-save sa browser.
  //
  // Kapag walang token, null ang ibabalik.
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // ==========================================
  // REMOVE TOKEN
  // ==========================================
  // Gagamitin kapag nag-logout ang user.
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // ==========================================
  // SAVE USERNAME
  // ==========================================
  setUsername(username: string): void {
    localStorage.setItem(this.usernameKey, username);
  }

  // ==========================================
  // GET USERNAME
  // ==========================================
  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  // ==========================================
  // CHECK LOGIN STATUS
  // ==========================================
  // true  = may token
  // false = walang token
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // Logout user
  logout(): void {
    this.removeToken();
  }
}
