import { Routes } from '@angular/router';
import { AuthGuard, AdminGuard } from './services/auth.guard';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard/login', pathMatch: 'full' },
  { path: 'dashboard/login', component: Login },
  {
    path: 'dashboard/admin',
    component: Admin,
    canActivate: [AdminGuard, AuthGuard],
  },
  { path: '**', redirectTo: '/dashboard/login' },
];
