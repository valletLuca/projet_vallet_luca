import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { SignInPage } from './features/auth/sign-in-page/sign-in-page';
import { AuthService } from './features/auth/services/auth.service';
import { SignUpPage } from './features/auth/sign-up-page/sign-up-page';
import { UserListPage } from './features/auth/user-list-page/user-list-page';
import { PollutionDeclarationPage } from './features/pollution/pollution-declaration-page/pollution-declaration-page';
import { PollutionDetailPage } from './features/pollution/pollution-detail-page/pollution-detail-page';
import { PollutionListPage } from './features/pollution/pollution-list-page/pollution-list-page';

const landingPage = () => (inject(AuthService).currentUser() ? '/pollutions' : '/connexion');

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: landingPage },
  { path: 'pollutions', title: 'Signalements · Sillage', component: PollutionListPage },
  {
    path: 'pollutions/nouvelle',
    title: 'Déclarer une pollution · Sillage',
    component: PollutionDeclarationPage,
  },
  { path: 'pollutions/:id', title: 'Détail du signalement · Sillage', component: PollutionDetailPage },
  {
    path: 'pollutions/:id/modifier',
    title: 'Modifier le signalement · Sillage',
    component: PollutionDeclarationPage,
  },
  { path: 'utilisateurs', title: 'Utilisateurs · Sillage', component: UserListPage },
  { path: 'inscription', title: 'Créer un compte · Sillage', component: SignUpPage },
  { path: 'connexion', title: 'Connexion · Sillage', component: SignInPage },
  { path: '**', redirectTo: landingPage },
];
