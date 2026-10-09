import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface StepperStep {
  label: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-stepper-header',
  templateUrl: './stepper-header.html',
  styleUrl: './stepper-header.scss',
})
export class StepperHeader {
  @Input({ required: true }) steps!: readonly StepperStep[];
  @Input() currentStep = 0;
  @Output() stepSelect = new EventEmitter<number>();

  get trackInset(): number {
    return 50 / this.steps.length;
  }

  get progress(): number {
    return (this.currentStep / (this.steps.length - 1)) * 100;
  }

  select(index: number): void {
    if (index < this.currentStep) {
      this.stepSelect.emit(index);
    }
  }
}
