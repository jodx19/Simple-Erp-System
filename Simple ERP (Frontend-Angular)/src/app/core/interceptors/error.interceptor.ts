import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === HttpStatusCode.Unauthorized) {
        auth.logout();
        snackBar.open('Session expired. Please log in again.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      } else if (error.status === HttpStatusCode.Forbidden) {
        router.navigate(['/dashboard']);
        snackBar.open('Access denied. Insufficient permissions.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      } else if (error.status === HttpStatusCode.Conflict) {
        // High-end ERP: Handle concurrency/stock conflicts
        snackBar.open(error.error?.message || 'Conflict detected. Please refresh or check stock.', 'Dismiss', {
          duration: 6000,
          panelClass: 'error-snackbar',
        });
      } else if (error.status === 0) {
        snackBar.open('Network error. Backend is unreachable.', 'Retry', {
          duration: 6000,
          panelClass: 'error-snackbar',
        });
      } else {
        // Fallback for other errors - Handle raw strings or object messages
        let msg = 'An unexpected error occurred';
        
        if (error instanceof HttpErrorResponse) {
          if (typeof error.error === 'string') {
            msg = error.error;
          } else if (error.error?.message) {
            msg = error.error.message;
          } else if (error.message) {
            msg = error.message;
          }
        }
        
        snackBar.open(msg, 'Close', { 
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
      return throwError(() => error);
    })
  );
};
