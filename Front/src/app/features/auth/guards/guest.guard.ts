import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const HOME_PATH = '/pollutions';

/** Réserve une route aux visiteurs : un utilisateur déjà connecté est renvoyé vers l'accueil. */
export const guestGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser() ? router.parseUrl(HOME_PATH) : true;
};
