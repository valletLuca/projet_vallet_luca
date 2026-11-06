import { Component } from '@angular/core';
import { AppHeader } from './core/app-header/app-header';
import { SignUpPage } from './features/auth/sign-up-page/sign-up-page';

@Component({
  selector: 'app-root',
  imports: [AppHeader, SignUpPage],
  templateUrl: './app.html',
})
export class App {}
