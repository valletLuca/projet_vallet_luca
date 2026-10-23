import { Routes } from '@angular/router';
import { PollutionDeclarationPage } from './features/pollution/pollution-declaration-page/pollution-declaration-page';
import { PollutionDetailPage } from './features/pollution/pollution-detail-page/pollution-detail-page';
import { PollutionListPage } from './features/pollution/pollution-list-page/pollution-list-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pollutions' },
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
  { path: '**', redirectTo: 'pollutions' },
];
