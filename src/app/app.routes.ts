import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',

    loadComponent: () =>
      import('./pages/login/login')
        .then(m => m.Login)
  },

  {
    path: 'register',

    loadComponent: () =>
      import('./pages/register/register')
        .then(m => m.Register)
  },

  {
    path: 'dashboard',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },

  {
    path: 'categories',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./pages/categories/categories')
        .then(m => m.Categories)
  },

  {
    path: 'account',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./pages/account/account')
        .then(m => m.Account)
  },

  {
    path: 'search',

    canActivate: [
      authGuard
    ],

    loadComponent: () =>
      import('./pages/search/search')
        .then(m => m.Search)
  },

  {
    path: 'admin',

    canActivate: [
      authGuard,
      adminGuard
    ],

    loadComponent: () =>
      import('./pages/admin/admin')
        .then(m => m.Admin)
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];