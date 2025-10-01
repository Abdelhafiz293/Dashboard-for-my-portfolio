import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private router: Router
  ) {
    // Initialize the reactive form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  // Form validation helpers
  get email() {
    return this.loginForm.get('email');
  }
  get password() {
    return this.loginForm.get('password');
  }

  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Handle form submission
  onSubmit() {
    console.log('Form submission started');
    console.log('Form valid:', this.loginForm.valid);
    console.log('Form values:', this.loginForm.value);

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
      };

      console.log('Attempting login with:', credentials);

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login response received:', response);
          this.isLoading = false;
          if (response.success) {
            console.log('Login successful! Attempting to navigate to admin...');
            // Let the router and guards handle the navigation
            this.router.navigate(['dashboard/admin']).then(
              (success) => {
                console.log('Navigation success:', success);
                if (!success) {
                  console.log(
                    'Navigation blocked by guard - user may not have admin access'
                  );
                  this.errorMessage =
                    'Access denied. Admin privileges required.';
                }
              },
              (error) => {
                console.error('Navigation error:', error);
                this.errorMessage = 'Navigation failed. Please try again.';
              }
            );
          } else {
            console.log('Login failed:', response.message);
            this.errorMessage =
              response.message || 'Login failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error details:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);

          // Check if it's a connection error
          if (error.status === 0) {
            this.errorMessage =
              'Cannot connect to server. Please check if the backend is running on http://localhost:5000';
          } else if (error.status === 404) {
            this.errorMessage =
              'Login endpoint not found. Please check backend routes.';
          } else {
            this.errorMessage =
              error.error?.message || 'An error occurred. Please try again.';
          }
        },
      });
    } else {
      console.log('Form is invalid');
      console.log('Form errors:', this.loginForm.errors);
      // Log individual field errors
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });

      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  // Clear error message when user starts typing
  clearError() {
    this.errorMessage = '';
  }
}
