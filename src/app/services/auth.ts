import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// Define interfaces for your auth data
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private sessionTimeoutId: any = null;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor(private router: Router, private http: HttpClient) {
    // Check if user is already logged in on service initialization
    this.checkAuthStatus();

    // Add window/tab close detection
    this.setupWindowCloseDetection();
  }

  // Setup detection for window/tab closing
  private setupWindowCloseDetection(): void {
    // Handle browser tab/window close
    window.addEventListener('beforeunload', (event) => {
      if (this.isAuthenticated()) {
        console.log('Window closing: Clearing authentication tokens');
        // Clear tokens on window close
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
      }
    });

    // Handle page visibility change (tab switching, minimizing)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isAuthenticated()) {
        console.log('Tab hidden: Checking token validity');
        // Optional: You can add additional security checks here
      }
    });

    // Handle when user navigates away from admin area
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (!event.url.includes('/admin') && this.isAuthenticated()) {
          console.log('Navigating away from admin area to:', event.url);
          // Optional: Clear sensitive data when leaving admin
        }
      });

    // Setup session timeout
    this.setupSessionTimeout();
  }

  // Setup automatic session timeout
  private setupSessionTimeout(): void {
    // Clear any existing timeout
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
    }

    // Set new timeout
    this.sessionTimeoutId = setTimeout(() => {
      if (this.isAuthenticated()) {
        console.log('Session timeout: Automatically logging out user');
        alert('Your session has expired. You will be logged out for security.');
        this.forceLogout();
      }
    }, this.SESSION_TIMEOUT);
  }

  // Reset session timeout (call this on user activity)
  resetSessionTimeout(): void {
    if (this.isAuthenticated()) {
      this.setupSessionTimeout();
    }
  }

  // Check authentication status
  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        // Invalid stored data, clear it
        this.logout();
      }
    }
  }

  // Login method that connects to your backend
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    console.log('Auth service: Starting login process...');
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        map((response) => {
          console.log('Auth service: Received response:', response);
          if (response.success && response.token && response.user) {
            console.log('Auth service: Login successful, storing data...');
            // Store token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Update current user subject
            this.currentUserSubject.next(response.user);

            // Start session timeout
            this.setupSessionTimeout();

            console.log('Auth service: Login completed, user data stored');
            return response;
          } else {
            console.log('Auth service: Login failed:', response);
          }
          return response;
        })
      );
  }

  // Register method
  register(registerData: RegisterData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, registerData)
      .pipe(
        map((response) => {
          if (response.success && response.token && response.user) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
            this.router.navigate(['/admin']);
          }
          return response;
        })
      );
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    //  Check if token is expired
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (tokenPayload.exp < currentTime) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Get user role
  getRole(): string {
    const user = this.getCurrentUser();
    return user?.role || '';
  }

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  // Logout method
  logout(): void {
    console.log('Auth: Logging out user...');

    // Clear session timeout
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }

    // Clear all stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // Clear any other auth-related storage
    localStorage.removeItem('authData');
    sessionStorage.removeItem('authData');

    // Reset current user state
    this.currentUserSubject.next(null);

    console.log('Auth: All tokens and user data cleared');

    // Navigate to login
    this.router.navigate(['/dashboard/login']);
  }

  // Force logout - more aggressive cleanup
  forceLogout(): void {
    console.log('Auth: Force logout initiated...');

    // Clear session timeout
    if (this.sessionTimeoutId) {
      clearTimeout(this.sessionTimeoutId);
      this.sessionTimeoutId = null;
    }

    // Clear all localStorage and sessionStorage
    const keysToRemove = ['token', 'user', 'authData', 'adminData'];
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Reset user state
    this.currentUserSubject.next(null);

    // Clear any cached HTTP requests
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe({
      next: () => console.log('Server logout successful'),
      error: (err) => console.log('Server logout failed:', err),
    });

    console.log('Auth: Force logout completed');
    this.router.navigate(['/dashboard/login']);
  }
}
