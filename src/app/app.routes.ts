import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home')
        .then(m => m.Home)
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
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories')
        .then(m => m.Categories)
  },
  {
    path: 'categories/:categoryId/lessons',
    loadComponent: () =>
      import('./pages/lessons/lessons')
        .then(m => m.Lessons)
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./pages/search/search')
        .then(m => m.Search)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/account/account')
        .then(m => m.Account)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin')
        .then(m => m.Admin),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard/admin-dashboard')
            .then(m => m.AdminDashboard)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/admin/admin-categories/admin-categories')
            .then(m => m.AdminCategories)
      },
      {
        path: 'lessons',
        loadComponent: () =>
          import('./pages/admin/admin-lessons/admin-lessons')
            .then(m => m.AdminLessons)
      },
      {
        path: 'quizzes',
        loadComponent: () =>
          import('./pages/admin/admin-quizzes/admin-quizzes')
            .then(m => m.AdminQuizzes)
      },
      {
        path: 'exercises',
        loadComponent: () =>
          import('./pages/admin/admin-exercises/admin-exercises')
            .then(m => m.AdminExercises)
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./pages/admin/admin-projects/admin-projects')
            .then(m => m.AdminProjects)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/admin-users/admin-users')
            .then(m => m.AdminUsers)
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./pages/admin/admin-audit-logs/admin-audit-logs')
            .then(m => m.AdminAuditLogs)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];