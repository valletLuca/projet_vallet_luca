import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SIGN_UP_ERROR_MESSAGES } from '../../../../const/messages.const';
import { EMAIL_PATTERN, FIELD_LIMITS, PASSWORD_RULES } from '../../../../const/validation.const';
import { FormField } from '../../../../shared/ui/form-field/form-field';
import { SignUpErrorReason, SignUpRequest } from '../../models/user.model';
import { matchFieldValidator } from '../../validators/match-field.validator';
import { notBlankValidator } from '../../validators/not-blank.validator';
import { passwordStrengthValidator } from '../../validators/password-strength.validator';

@Component({
  selector: 'app-sign-up-form',
  imports: [ReactiveFormsModule, FormField],
  templateUrl: './sign-up-form.html',
  styleUrl: './sign-up-form.scss',
})
export class SignUpForm implements OnChanges {
  @Input() pending = false;
  @Input() error: SignUpErrorReason | null = null;
  @Output() submitted = new EventEmitter<SignUpRequest>();

  protected readonly limits = FIELD_LIMITS;
  protected passwordVisible = false;

  readonly form = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator(),
        Validators.maxLength(FIELD_LIMITS.nameMaxLength),
      ],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        notBlankValidator(),
        Validators.maxLength(FIELD_LIMITS.nameMaxLength),
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(EMAIL_PATTERN),
        Validators.maxLength(FIELD_LIMITS.emailMaxLength),
      ],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(FIELD_LIMITS.passwordMinLength),
        Validators.maxLength(FIELD_LIMITS.passwordMaxLength),
        passwordStrengthValidator(),
      ],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, matchFieldValidator('password')],
    }),
  });

  protected readonly controls = this.form.controls;

  constructor() {
    // La confirmation dépend du mot de passe : on la revalide à chaque modification de celui-ci.
    this.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.controls.confirmPassword.updateValueAndValidity({ emitEvent: false }));
  }

  get passwordRules() {
    const value = this.controls.password.value;
    return PASSWORD_RULES.map((rule) => ({ label: rule.label, ok: rule.test(value) }));
  }

  /** Les erreurs non liées à un champ s'affichent dans un bandeau. */
  get bannerMessage(): string | null {
    return this.error && this.error !== 'email-taken' ? SIGN_UP_ERROR_MESSAGES[this.error] : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // L'ordre compte : `enable()` relance les validateurs et effacerait l'erreur `emailTaken`.
    if (changes['pending']) {
      if (this.pending) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    }
    if (changes['error'] && this.error === 'email-taken') {
      this.controls.email.setErrors({ emailTaken: true });
      this.controls.email.markAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.pending || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { firstName, lastName, email, password } = this.form.getRawValue();
    this.submitted.emit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
  }
}
