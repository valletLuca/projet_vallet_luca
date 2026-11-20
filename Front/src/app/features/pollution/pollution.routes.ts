import { Routes } from '@angular/router';

/** Routes de la fonctionnalité « signalements », chargées à la demande depuis `app.routes.ts`. */
export const POLLUTION_ROUTES: Routes = [
  {
    path: '',
    title: 'Signalements · Sillage',
    loadComponent: () =>
      import('./pollution-list-page/pollution-list-page').then((m) => m.PollutionListPage),
  },
  {
    path: 'nouvelle',
    title: 'Déclarer une pollution · Sillage',
    loadComponent: () =>
      import('./pollution-declaration-page/pollution-declaration-page').then(
        (m) => m.PollutionDeclarationPage,
      ),
  },
  {
    path: ':id',
    title: 'Détail du signalement · Sillage',
    loadComponent: () =>
      import('./pollution-detail-page/pollution-detail-page').then((m) => m.PollutionDetailPage),
  },
  {
    path: ':id/modifier',
    title: 'Modifier le signalement · Sillage',
    loadComponent: () =>
      import('./pollution-declaration-page/pollution-declaration-page').then(
        (m) => m.PollutionDeclarationPage,
      ),
  },
];
