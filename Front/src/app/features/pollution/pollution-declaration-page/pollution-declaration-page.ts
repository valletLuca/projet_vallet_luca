import { Component, signal } from '@angular/core';
import { StepperHeader } from '../../../shared/ui/stepper-header/stepper-header';
import { PollutionForm } from '../components/pollution-form/pollution-form';
import { PollutionRecap } from '../components/pollution-recap/pollution-recap';
import { PollutionDeclaration } from '../models/pollution.model';
import { POLLUTION_STEPS } from '../pollution-steps';

@Component({
  selector: 'app-pollution-declaration-page',
  imports: [StepperHeader, PollutionForm, PollutionRecap],
  templateUrl: './pollution-declaration-page.html',
  styleUrl: './pollution-declaration-page.scss',
})
export class PollutionDeclarationPage {
  protected readonly steps = POLLUTION_STEPS;
  protected readonly currentStep = signal(0);
  protected readonly declaration = signal<PollutionDeclaration | null>(null);
  protected readonly draft = signal<PollutionDeclaration | null>(null);
  protected readonly returningFromRecap = signal(false);

  onStepChange(step: number): void {
    this.currentStep.set(step);
  }

  onDeclared(declaration: PollutionDeclaration): void {
    this.declaration.set(declaration);
  }

  onEdit(): void {
    this.draft.set(this.declaration());
    this.returningFromRecap.set(true);
    this.declaration.set(null);
    this.currentStep.set(0);
  }

  onRestart(): void {
    this.draft.set(null);
    this.returningFromRecap.set(true);
    this.declaration.set(null);
    this.currentStep.set(0);
  }
}
