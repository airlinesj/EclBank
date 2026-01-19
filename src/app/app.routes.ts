import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'banking',
    loadComponent: () => import('./modules/banking/banking.component').then(m => m.BankingComponent)
  },
  {
    path: 'ecl',
    loadComponent: () => import('./modules/ecl/ecl.component').then(m => m.EclComponent)
  },
  {
    path: 'reports',
    loadComponent: () => import('./modules/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'audit',
    loadComponent: () => import('./modules/audit/audit.component').then(m => m.AuditComponent)
  }
];
