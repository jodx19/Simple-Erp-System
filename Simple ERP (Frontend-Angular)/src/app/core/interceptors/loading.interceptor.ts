import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Start loading
  loadingService.setLoading(true);

  return next(req).pipe(
    finalize(() => {
      // Stop loading
      loadingService.setLoading(false);
    })
  );
};
