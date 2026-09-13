import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';

import { ThemeService } from '../../services/theme/user-theme.service';
import { UserTheme } from '../../models/theme/user-theme';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService } from '../../services/settings/settings.service';
import { ChangePasswordRequest } from '../../models/settings/change-password-request';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../components/dialogs/confirm-dialog/confirm-dialog';
import { AuthService } from '../../services/authentication/auth.service';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  themeForm;

  passwordForm!: ReturnType<FormBuilder['group']>;

  readonly colorSetting = signal<'basic' | 'advanced' | ''>('');
  private currentTheme!: UserTheme;

  isChangingPassword = false;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  readonly hideCurrentPassword = signal(true);
  readonly hideNewPassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  clickCurrentPasswordEvent(event: MouseEvent): void {
    event.preventDefault();
    this.hideCurrentPassword.update((value) => !value);
  }

  clickNewPasswordEvent(event: MouseEvent): void {
    event.preventDefault();
    this.hideNewPassword.update((value) => !value);
  }

  clickConfirmPasswordEvent(event: MouseEvent): void {
    event.preventDefault();
    this.hideConfirmPassword.update((value) => !value);
  }
  // Error message kapag mali ang current password.
  readonly currentPasswordError = signal('');

  constructor(
    private fb: FormBuilder,
    private themeService: ThemeService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
  ) {
    this.themeForm = this.fb.group({
      themeProfile: ['system'],
      colorSetting: [''],
      themeBasicProfile: ['hacker'],

      primaryColor: [''],
      secondaryColor: [''],
      primaryFontColor: [''],
      secondaryFontColor: [''],
      accentColor: [''],
    });

    // PASSWORD Validation Form
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  ngOnInit(): void {
    this.watchThemeChanges();
    this.loadUserTheme();
  }

  private loadUserTheme(): void {
    const username = localStorage.getItem('username');

    if (!username) {
      return;
    }

    this.themeService.getUserTheme(username).subscribe({
      next: (theme: UserTheme) => {
        this.currentTheme = theme;

        const basicProfile = this.getBasicProfile(theme);
        const colorSetting = this.getColorSetting(theme);

        // The theme request may finish outside Angular's normal change-detection
        // cycle. A signal guarantees that the matching settings panel is rendered.
        this.colorSetting.set(colorSetting);

        this.themeForm.patchValue(
          {
            themeProfile: theme.themeMode,
            colorSetting: colorSetting,
            themeBasicProfile: basicProfile,
            primaryColor: theme.primaryColor,
            secondaryColor: theme.secondaryColor,
            primaryFontColor: theme.primaryFontColor,
            secondaryFontColor: theme.secondaryFontColor,
            accentColor: theme.accentColor,
          },
          {
            emitEvent: false,
          },
        );

        this.themeService.applyTheme(theme);
      },

      error: (error) => {
        console.error('Failed to load user theme:', error);
      },
    });
  }

  private getBasicProfile(theme: UserTheme): string {
    if (
      theme.primaryColor.toUpperCase() === '#10B981' &&
      theme.secondaryColor.toUpperCase() === '#059669' &&
      theme.accentColor.toUpperCase() === '#84CC16'
    ) {
      return 'hacker';
    }

    if (
      theme.primaryColor.toUpperCase() === '#F472B6' &&
      theme.secondaryColor.toUpperCase() === '#EC4899' &&
      theme.accentColor.toUpperCase() === '#A78BFA'
    ) {
      return 'candy';
    }

    return 'hacker';
  }

  private getColorSetting(theme: UserTheme): 'basic' | 'advanced' {
    const primary = theme.primaryColor?.toUpperCase();
    const secondary = theme.secondaryColor?.toUpperCase();
    const accent = theme.accentColor?.toUpperCase();

    const isHacker = primary === '#10B981' && secondary === '#059669' && accent === '#84CC16';

    const isCandy = primary === '#F472B6' && secondary === '#EC4899' && accent === '#A78BFA';

    return isHacker || isCandy ? 'basic' : 'advanced';
  }

  private watchThemeChanges(): void {
    this.themeForm.get('themeProfile')?.valueChanges.subscribe((value) => {
      if (!this.currentTheme) {
        return;
      }

      this.currentTheme.themeMode = value ?? 'system';

      this.updateFontColorsByTheme();

      this.themeService.applyTheme(this.currentTheme);
      this.saveTheme();
    });

    this.themeForm.get('colorSetting')?.valueChanges.subscribe((value) => {
      this.colorSetting.set(value === 'basic' || value === 'advanced' ? value : '');

      if (!this.currentTheme || !value) {
        return;
      }

      if (value === 'basic') {
        const profile = this.themeForm.get('themeBasicProfile')?.value ?? 'hacker';
        this.applyBasicTheme(profile);
      }
    });

    this.themeForm.get('themeBasicProfile')?.valueChanges.subscribe((value) => {
      if (!this.currentTheme || value === null) {
        return;
      }

      this.applyBasicTheme(value);
    });

    this.watchColor('primaryColor');
    this.watchColor('secondaryColor');
    this.watchColor('primaryFontColor');
    this.watchColor('secondaryFontColor');
    this.watchColor('accentColor');
  }

  private updateFontColorsByTheme(): void {
    if (!this.currentTheme) {
      return;
    }

    const themeMode = this.currentTheme.themeMode;

    const isDark =
      themeMode === 'dark' ||
      (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      this.currentTheme.primaryFontColor = '#FFFFFF';
      this.currentTheme.secondaryFontColor = '#9CA3AF';
    } else {
      this.currentTheme.primaryFontColor = '#000000';
      this.currentTheme.secondaryFontColor = '#6B7280';
    }

    this.themeForm.patchValue(
      {
        primaryFontColor: this.currentTheme.primaryFontColor,
        secondaryFontColor: this.currentTheme.secondaryFontColor,
      },
      {
        emitEvent: false,
      },
    );
  }

  private watchColor(controlName: string): void {
    this.themeForm
      .get(controlName)
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        if (!this.currentTheme || !value) {
          return;
        }

        (this.currentTheme as any)[controlName] = value;
        this.colorSetting.set('advanced');

        this.themeForm.patchValue(
          {
            colorSetting: 'advanced',
          },
          {
            emitEvent: false,
          },
        );

        this.themeService.applyTheme(this.currentTheme);
        this.saveTheme();
      });
  }

  private applyBasicTheme(profile: string): void {
    if (!this.currentTheme) {
      return;
    }

    if (profile === 'hacker') {
      this.currentTheme.primaryColor = '#10B981';
      this.currentTheme.secondaryColor = '#059669';
      this.updateFontColorsByTheme();
      this.currentTheme.accentColor = '#84CC16';
    } else if (profile === 'candy') {
      this.currentTheme.primaryColor = '#F472B6';
      this.currentTheme.secondaryColor = '#EC4899';
      this.updateFontColorsByTheme();
      this.currentTheme.accentColor = '#A78BFA';
    }

    // Update form without triggering color valueChanges again
    this.themeForm.patchValue(
      {
        primaryColor: this.currentTheme.primaryColor,
        secondaryColor: this.currentTheme.secondaryColor,
        primaryFontColor: this.currentTheme.primaryFontColor,
        secondaryFontColor: this.currentTheme.secondaryFontColor,
        accentColor: this.currentTheme.accentColor,
      },
      {
        emitEvent: false,
      },
    );

    // Update UI immediately
    this.themeService.applyTheme(this.currentTheme);

    // Update DB immediately
    this.saveTheme();
  }

  private saveTheme(): void {
    const username = localStorage.getItem('username');

    if (!username || !this.currentTheme) {
      return;
    }

    this.themeService.updateUserTheme(username, this.currentTheme).subscribe({
      error: (error) => {
        console.error('Failed to update user theme:', error);
      },
    });
  }

  private passwordMatchValidator(form: any) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // =========================================================
  // CHANGE PASSWORD
  // =========================================================

  changePassword(): void {
    // Huwag ituloy kung invalid ang Change Password form.
    if (this.passwordForm.invalid) {
      return;
    }

    // Ipakita muna ang confirmation dialog bago baguhin ang password.
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Change Password?',
        message:
          'Are you sure you want to change your password? You will be logged out after changing your password.',
        icon: '🔐',
        confirmText: 'Change Password',
        cancelText: 'Cancel',
      },
    });

    // Hintayin kung pinindot ng user ang Confirm o Cancel.
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      // Kapag Cancel, walang gagawin.
      if (!confirmed) {
        return;
      }

      // Kapag Confirm, saka lang tatawagin ang API.
      this.submitChangePassword();
    });
  }

  private submitChangePassword(): void {
    // I-set sa true para maging "Changing..." ang button.
    this.isChangingPassword = true;

    // I-clear ang previous error message.
    this.currentPasswordError.set('');

    // Ihanda ang request na ipapadala sa ASP.NET Core API.
    const request: ChangePasswordRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword,
    };

    // Tawagin ang Change Password API.
    this.settingsService.changePassword(request).subscribe({
      next: (response) => {
        // API successfully responded.
        console.log('Change Password Response:', response);

        // Ibalik ang loading state.
        this.isChangingPassword = false;

        // Store success message before logging out.
        sessionStorage.setItem('loginSuccessMessage', 'Password changed successfully.');

        // Dahil successful ang password change,
        // logout ang user.
        this.authService.logout();
        this.router.navigate(['/login']);
      },

      error: (error) => {
        // Ibalik ang button sa normal state.
        this.isChangingPassword = false;

        // Kunin ang message na galing sa API.
        const message = error.error?.message;

        // Kapag incorrect ang current password,
        // ipakita ang error sa ilalim ng Current Password field.
        if (message === 'Current password is incorrect.') {
          this.currentPasswordError.set(message);
          return;
        }

        console.error('Change Password Error:', error);
      },
    });
  }
}
