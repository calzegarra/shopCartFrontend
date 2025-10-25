import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const dashboardGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.role;
  if (role === 'ADMINISTRADOR' || role === 'EMPLEADO') {
    return true;
  }
  router.navigateByUrl('/future-videogames');
  return false;
};

