import { Injectable } from '@angular/core';
import { CanActivate, CanDeactivate, Router } from '@angular/router';
import { Auth } from './auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: Auth, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/dashboard/login']);
      return false;
    }
  }
}

// Additional guard for admin-only routes
@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: Auth, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdmin();

    console.log('AdminGuard: Authentication check:', {
      isAuthenticated,
      isAdmin,
    });

    if (isAuthenticated && isAdmin) {
      return true;
    } else {
      console.log('AdminGuard: Access denied, redirecting to login');
      this.router.navigate(['/dashboard/login']);
      return false;
    }
  }
}

// Guard to handle leaving admin area
@Injectable({
  providedIn: 'root',
})
export class AdminDeactivateGuard implements CanDeactivate<any> {
  constructor(private authService: Auth) {}

  canDeactivate(): boolean {
    console.log('AdminDeactivateGuard: User leaving admin area');

    // Allow navigation when logging out
    if (!this.authService.isAuthenticated()) {
      console.log(
        'AdminDeactivateGuard: User already logged out, allowing navigation'
      );
      return true;
    }

    // Optional: Show confirmation dialog only for other navigations
    const confirmLeave = confirm(
      'Are you sure you want to leave the admin area?'
    );

    if (confirmLeave) {
      console.log('AdminDeactivateGuard: User confirmed leaving admin area');
      return true;
    }

    console.log('AdminDeactivateGuard: User cancelled leaving admin area');
    return false;
  }
}
