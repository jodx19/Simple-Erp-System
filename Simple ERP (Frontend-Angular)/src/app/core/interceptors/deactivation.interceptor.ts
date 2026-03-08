import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const deactivationInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Check for 403 Forbidden or specific business logic errors related to deactivation
      if (error.status === 403) {
        // Option 1: Logout and redirect
        authService.logout();
        router.navigate(['/account-disabled']);
      }
      
      // Also handle potential 401 if token is invalidated due to deactivation
      if (error.status === 401 && !req.url.includes('login')) {
         // Logic to check if user became inactive could go here
      }

      return throwError(() => error);
    })
  );
};
