import { Component, signal } from '@angular/core';
import { SIGNUP_STEPS, SignupData, SignupResult } from '../models/signup.model';
import { SignupConfirmation } from '../components/signup-confirmation/signup-confirmation';
import { SignupForm } from '../components/signup-form/signup-form';
import { StepperHeader } from '../components/stepper-header/stepper-header';

@Component({
  selector: 'app-signup-page',
  imports: [StepperHeader, SignupForm, SignupConfirmation],
  templateUrl: './signup-page.html',
  styleUrl: './signup-page.scss',
})
export class SignupPage {
  protected readonly steps = SIGNUP_STEPS;
  protected readonly currentStep = signal(0);
  protected readonly result = signal<SignupResult | null>(null);

  onStepChange(step: number): void {
    this.currentStep.set(step);
  }

  onSubmitted(data: SignupData): void {
    // On ne conserve jamais le mot de passe au-delà du formulaire.
    const { password, passwordConfirm, ...result } = data;
    this.result.set(result);
  }

  onRestart(): void {
    this.result.set(null);
    this.currentStep.set(0);
  }
}
