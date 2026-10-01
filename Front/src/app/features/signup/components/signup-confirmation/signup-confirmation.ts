import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SignupResult } from '../../models/signup.model';

@Component({
  selector: 'app-signup-confirmation',
  templateUrl: './signup-confirmation.html',
  styleUrl: './signup-confirmation.scss',
})
export class SignupConfirmation {
  @Input({ required: true }) user!: SignupResult;
  @Output() restart = new EventEmitter<void>();
}
