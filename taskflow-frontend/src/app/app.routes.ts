import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { 
    path: 'login', 
    /*this is  Lazy Loading.
    Only loads login component when user visits /login
     Faster startup - app loads quicker initially.

  .then() handles the Promise.
  What m => m.LoginComponent returns:
 Just the LoginComponent class, nothing else!

*/
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }



];