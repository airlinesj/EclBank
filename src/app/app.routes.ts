import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./modules/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'banking',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/banking/banking.component').then(m => m.BankingComponent)
  },
  {
    path: 'ecl',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/ecl/ecl.component').then(m => m.EclComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'audit',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/audit/audit.component').then(m => m.AuditComponent)
  }
];

