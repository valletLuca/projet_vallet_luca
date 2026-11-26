import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard, SIGN_IN_PATH } from './features/auth/guards/auth.guard';
import { guestGuard, HOME_PATH } from './features/auth/guards/guest.guard';
import { AuthService } from './features/auth/services/auth.service';

const landingPage = () => (inject(AuthService).currentUser() ? HOME_PATH : SIGN_IN_PATH);

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: landingPage },
  {
    path: 'pollutions',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./features/pollution/pollution.routes').then((m) => m.POLLUTION_ROUTES),
  },
  {
    path: 'utilisateurs',
    title: 'Utilisateurs · Sillage',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/auth/user-list-page/user-list-page').then((m) => m.UserListPage),
  },
  {
    path: 'inscription',
    title: 'Créer un compte · Sillage',
    loadComponent: () =>
      import('./features/auth/sign-up-page/sign-up-page').then((m) => m.SignUpPage),
  },
  {
    path: 'connexion',
    title: 'Connexion · Sillage',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./features/auth/sign-in-page/sign-in-page').then((m) => m.SignInPage),
  },
  { path: '**', redirectTo: landingPage },
];
