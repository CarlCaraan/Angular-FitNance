import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/authentication/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if the user is logged in
  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login if not authenticated
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
