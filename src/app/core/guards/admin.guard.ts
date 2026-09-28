import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Auth } from '../../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.me().pipe(
    map(user =>
      user.role === 'admin'
        ? true
        : router.createUrlTree(['/dashboard'])
    ),
    catchError(() =>
      of(router.createUrlTree(['/login']))
    )
  );
};


/* import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  catchError,
  map,
  of
} from 'rxjs';

import { Auth } from '../../services/auth';

export const adminGuard: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {

    return router.createUrlTree([
      '/login'
    ]);

  }

  return auth.me().pipe(

    map(user => {

      if (user.role === 'admin') {
        return true;
      }

      return router.createUrlTree([
        '/dashboard'
      ]);

    }),

    catchError(() => {

      auth.clearAuth();

      return of(
        router.createUrlTree([
          '/login'
        ])
      );

    })

  );
}; */