import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const SIGN_IN_PATH = '/connexion';
export const REDIRECT_PARAM = 'redirectTo';

/**
 * Réserve une route aux utilisateurs connectés. `canMatch` évite aussi de
 * télécharger le chunk lazy-loadé d'une page à laquelle le visiteur n'a pas accès.
 * Le visiteur est renvoyé vers la connexion, qui le ramènera ensuite à l'adresse demandée.
 */
export const authGuard: CanMatchFn = (_route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }
  const requestedUrl = `/${segments.map(({ path }) => path).join('/')}`;
  return router.createUrlTree([SIGN_IN_PATH], { queryParams: { [REDIRECT_PARAM]: requestedUrl } });
};
