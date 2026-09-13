import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserTheme } from '../../models/theme/user-theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private apiUrl = `${environment.apiUrl}/api/UserTheme`;

  constructor(private http: HttpClient) {}

  getUserTheme(username: string): Observable<UserTheme> {
    return this.http.get<UserTheme>(`${this.apiUrl}/${username}`);
  }

  updateUserTheme(username: string, theme: UserTheme): Observable<any> {
    return this.http.put(`${this.apiUrl}/${username}`, theme);
  }

  applyTheme(theme: UserTheme): void {
    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);

    const isDark =
      theme.themeMode === 'dark' ||
      (theme.themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.style.setProperty('--primary-font-color', '#FFFFFF');
      root.style.setProperty('--secondary-font-color', '#9CA3AF');
    } else {
      root.style.setProperty('--primary-font-color', '#000000');
      root.style.setProperty('--secondary-font-color', '#6B7280');
    }

    this.applyThemeMode(theme.themeMode);
  }

  private applyThemeMode(themeMode: string): void {
    const root = document.documentElement;

    const isDark =
      themeMode === 'dark' ||
      (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
  }
}
