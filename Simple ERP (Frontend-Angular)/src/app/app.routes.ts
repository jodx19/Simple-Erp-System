import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'account-disabled',
    loadComponent: () =>
      import('./features/auth/account-disabled/account-disabled.component').then((m) => m.AccountDisabledComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products-list/products-list.component').then(
            (m) => m.ProductsListComponent
          ),
      },
      {
        path: 'logs',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/logs/logs.component').then((m) => m.LogsComponent),
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./features/admin/user-management/user-management.component').then((m) => m.UserManagementComponent),
      },
      {
        path: 'pos',
        canActivate: [roleGuard],
        data: { roles: ['Admin', 'Manager', 'Employee'] },
        loadComponent: () =>
          import('./features/pos/pos.component').then((m) => m.POSComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/orders-list/orders-list.component').then((m) => m.OrdersListComponent),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/crm/customers-list/customers-list.component').then((m) => m.CustomersListComponent),
      },
      {
        path: 'suppliers',
        loadComponent: () =>
          import('./features/srm/suppliers-list/suppliers-list.component').then((m) => m.SuppliersListComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
