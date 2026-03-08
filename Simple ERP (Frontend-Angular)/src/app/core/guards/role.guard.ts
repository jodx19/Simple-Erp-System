import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const roles = route.data?.['roles'] as string[] | undefined;

  if (roles && auth.isInRole(roles)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
