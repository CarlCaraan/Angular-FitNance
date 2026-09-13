import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/authentication/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Kinukuha natin ang AuthService
  // para makuha ang JWT token na naka-save sa localStorage.
  const authService = inject(AuthService);

  // Kunin ang JWT token
  const token = authService.getToken();

  // ==========================================
  // MAY JWT TOKEN
  // ==========================================
  if (token) {
    // Hindi natin directly binabago ang original request.
    // Gumagawa tayo ng cloned request.
    const authReq = req.clone({
      // Idinadagdag ang Authorization header.
      //
      // Format:
      // Authorization: Bearer <JWT>
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Ipagpatuloy ang modified request.
    return next(authReq);
  }

  // ==========================================
  // WALANG JWT TOKEN
  // ==========================================
  // Kung walang token, normal request lang ang ipapadala.
  return next(req);
};
