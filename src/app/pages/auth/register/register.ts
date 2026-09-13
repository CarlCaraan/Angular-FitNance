import { Component, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RegisterService } from '../../../services/authentication/register.service';
import { RegisterRequest } from '../../../models/authentication/register-request';
import { AuthService } from '../../../services/authentication/auth.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatProgressBarModule],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  registerForm: FormGroup;
  errorMessage = signal('');
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        lastName: ['', Validators.required],

        firstName: ['', Validators.required],

        middleName: [''],

        username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],

        password: ['', [Validators.required, Validators.minLength(8)]],

        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    console.log(this.registerForm.value);

    const request: RegisterRequest = this.registerForm.value;

    this.isLoading = true;

    console.log('Register Request:', request);

    this.registerService.register(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Registration successful!');
        console.log('Username:', response.username);
        console.log('Is Profile Complete:', response.isProfileComplete);

        // Save JWT
        this.authService.setToken(response.token);

        // Redirect based on profile status
        if (response.isProfileComplete) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/profile-setup']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.log('Registration failed:', error);
        console.log('HTTP Status:', error.status);
        console.log('Error Body:', error.error);

        this.errorMessage.set(
          typeof error.error === 'string' ? error.error : 'Registration failed. Please try again.',
        );
      },
    });
  }
}
