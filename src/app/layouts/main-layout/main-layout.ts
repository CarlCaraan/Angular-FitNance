import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../../components/sidebar/sidebar';
import { ThemeService } from '../../services/theme/user-theme.service';
import { AuthService } from '../../services/authentication/auth.service';
import { UserTheme } from '../../models/theme/user-theme';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from '../../services/loading/loading.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, MatProgressBarModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    public loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.loadUserTheme();
  }

  private loadUserTheme(): void {
    const username = this.authService.getUsername();

    console.log('Loading user theme for username:', username);

    if (!username) {
      return;
    }

    this.themeService.getUserTheme(username).subscribe({
      next: (theme: UserTheme) => {
        this.applyTheme(theme);
      },
      error: (error) => {
        console.error('Failed to load user theme.', error);
      },
    });
  }

  private applyTheme(theme: UserTheme): void {
    const root = document.documentElement;

    console.log('Applying user theme:', theme);

    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--primary-font-color', theme.primaryFontColor);
    root.style.setProperty('--secondary-font-color', theme.secondaryFontColor);
    root.style.setProperty('--accent-color', theme.accentColor);

    // ==========================================
    // THEME MODE
    // ==========================================

    let themeMode = theme.themeMode;

    if (themeMode === 'system') {
      themeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.remove('light', 'dark');
    root.classList.add(themeMode);

    console.log('Applied theme mode:', themeMode);
  }
}
