import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { LoginService } from '../../../services/authentication/login.service';
import { AuthService } from '../../../services/authentication/auth.service';
import { LoginRequest } from '../../../models/authentication/login-request';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatProgressBarModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Dito natin ilalagay ang login form.
  loginForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);
  hide = signal(true);
  public loginSuccessMessage = signal('');

  clickEvent(event: MouseEvent): void {
    event.preventDefault();
    this.hide.set(!this.hide());
  }

  constructor(
    // FormBuilder para gumawa ng Reactive Form.
    private fb: FormBuilder,

    // Para matawag natin ang /login API.
    private loginService: LoginService,

    // Para ma-save natin ang JWT token.
    private authService: AuthService,

    // Router para makapag-navigate sa ibang page
    // pagkatapos successful ang login.
    private router: Router,
  ) {
    // Gumagawa ng Login Form
    this.loginForm = this.fb.group({
      // Username field
      username: ['', Validators.required],

      // Password field
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const message = sessionStorage.getItem('loginSuccessMessage');

    if (message) {
      this.loginSuccessMessage.set(message);
      sessionStorage.removeItem('loginSuccessMessage');
    }
  }

  // ==========================================
  // LOGIN
  // ==========================================
  onSubmit(): void {
    // console.log('🔥 onSubmit START');
    // console.log('isLoading BEFORE:', this.isLoading());

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('');
      return;
    }

    const request: LoginRequest = this.loginForm.value;

    this.isLoading.set(true);

    // console.log('🔥 isLoading SET TO:', this.isLoading());

    this.loginService.login(request).subscribe({
      // ==========================================
      // SUCCESS
      // ==========================================
      next: (response) => {
        // console.log('✅ SUCCESS');

        this.isLoading.set(false);

        // console.log('isLoading AFTER SUCCESS:', this.isLoading());

        // ==========================================
        // SAVE JWT
        // ==========================================
        this.authService.setToken(response.token);

        // ==========================================
        // SAVE USERNAME
        // ==========================================
        this.authService.setUsername(response.username);

        // ==========================================
        // CHECK PROFILE STATUS
        // ==========================================
        if (response.isProfileComplete) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/profile-setup']);
        }
      },

      // ==========================================
      // ERROR
      // ==========================================
      error: (error) => {
        // console.log('❌ ERROR CALLBACK');

        // console.log('isLoading BEFORE FALSE:', this.isLoading());

        this.isLoading.set(false);

        // console.log('isLoading AFTER FALSE:', this.isLoading());

        // console.log('HTTP Status:', error.status);
        // console.log('Error Object:', error);
        // console.log('Error Body:', error.error);

        this.errorMessage.set(
          typeof error.error === 'string' ? error.error : 'Invalid username or password.',
        );
      },
    });
  }
}
