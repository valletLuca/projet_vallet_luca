import { Component } from '@angular/core';
import { AppHeader } from './core/app-header/app-header';
import { PollutionDeclarationPage } from './features/pollution/pollution-declaration-page/pollution-declaration-page';

@Component({
  selector: 'app-root',
  imports: [AppHeader, PollutionDeclarationPage],
  templateUrl: './app.html',
})
export class App {}
