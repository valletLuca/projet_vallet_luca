import {
  afterNextRender,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule, NgForm, NgModelGroup } from '@angular/forms';
import { SignupData, SignupStep } from '../../models/signup.model';
import { MatchPasswordValidator } from '../../validators/match-password.validator';
import { PasswordRulesValidator } from '../../validators/password-rules.validator';
import { FormField } from '../form-field/form-field';
import { PasswordStrength } from '../password-strength/password-strength';

@Component({
  selector: 'app-signup-form',
  imports: [
    FormsModule,
    NgTemplateOutlet,
    FormField,
    PasswordStrength,
    MatchPasswordValidator,
    PasswordRulesValidator,
  ],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm implements OnChanges {
  @Input({ required: true }) steps!: readonly SignupStep[];
  @Input() currentStep = 0;
  @Output() stepChange = new EventEmitter<number>();
  @Output() submitted = new EventEmitter<SignupData>();

  @ViewChild('form') private form!: NgForm;
  @ViewChildren(NgModelGroup) private stepGroups!: QueryList<NgModelGroup>;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected model: SignupData = {
    firstName: '',
    lastName: '',
    email: '',
    login: '',
    password: '',
    passwordConfirm: '',
  };

  protected direction: 'forward' | 'backward' = 'forward';
  protected showPassword = false;
  protected showPasswordConfirm = false;

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const step = changes['currentStep'];
    if (step && !step.firstChange) {
      this.direction = step.currentValue > step.previousValue ? 'forward' : 'backward';
      afterNextRender(() => this.focusFirstField(), { injector: this.injector });
    }
  }

  previous(): void {
    if (this.currentStep > 0) {
      this.stepChange.emit(this.currentStep - 1);
    }
  }

  onSubmit(): void {
    if (!this.isLastStep) {
      if (this.stepGroups.get(this.currentStep)?.valid) {
        this.stepChange.emit(this.currentStep + 1);
      }
      return;
    }

    if (this.form.invalid) {
      this.form.control.markAllAsTouched();
      return;
    }
    this.submitted.emit({ ...this.model });
  }

  private focusFirstField(): void {
    this.host.nativeElement
      .querySelector<HTMLInputElement>(`[data-step="${this.currentStep}"] input`)
      ?.focus();
  }
}
