import { Component } from '@angular/core';
import { SignupPage } from './features/signup/signup-page/signup-page';

@Component({
  selector: 'app-root',
  imports: [SignupPage],
  template: '<app-signup-page />',
})
export class App {}
