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
  isLoading: boolean = false;
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
    // Check muna kung valid ang form.
    if (this.loginForm.invalid) {
      // Ipapakita ang validation errors
      // kung may required field na hindi filled-up.
      this.loginForm.markAllAsTouched();

      // Clear previous API error
      this.errorMessage.set('');

      return;
    }

    // Kunin ang values ng form.
    //
    // Example:
    // {
    //   username: "womoves123",
    //   password: "********"
    // }
    const request: LoginRequest = this.loginForm.value;

    this.isLoading = true;

    // Tawagin ang Login API
    this.loginService.login(request).subscribe({
      // ==========================================
      // SUCCESS
      // ==========================================
      next: (response) => {
        this.isLoading = false;
        console.log('Login successful!');
        console.log('Username:', response.username);
        console.log('Is Profile Complete:', response.isProfileComplete);

        // I-save ang JWT token sa localStorage.
        //
        // Pagkatapos nito, ang AuthInterceptor
        // na ang bahala na idagdag ang token
        // sa mga susunod na API requests.
        // ==========================================
        // SAVE JWT
        // ==========================================
        this.authService.setToken(response.token);
        console.log('JWT token saved.');

        // ==========================================
        // SAVE USERNAME
        // ==========================================
        this.authService.setUsername(response.username);
        console.log('Username saved.');

        // ==========================================
        // CHECK PROFILE STATUS
        // ==========================================
        if (response.isProfileComplete) {
          // true
          // Profile is already complete
          // → Dashboard

          this.router.navigate(['/dashboard']);
        } else {
          // false
          // Profile is NOT complete yet
          // → Profile Setup

          this.router.navigate(['/profile-setup']);
        }
      },

      // ==========================================
      // ERROR
      // ==========================================
      error: (error) => {
        this.isLoading = false;
        console.error('Login failed:', error);
        // Get error message returned by .NET API

        console.log('HTTP Status:', error.status);
        console.log('Error Object:', error);
        console.log('Error Body:', error.error);

        this.errorMessage.set(
          typeof error.error === 'string' ? error.error : 'Invalid username or password.',
        );
      },
    });
  }
}
