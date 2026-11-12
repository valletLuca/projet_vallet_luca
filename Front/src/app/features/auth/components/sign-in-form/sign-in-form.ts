import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SIGN_IN_ERROR_MESSAGES } from '../../../../const/messages.const';
import { FormField } from '../../../../shared/ui/form-field/form-field';
import { SignInErrorReason, SignInRequest } from '../../models/user.model';

@Component({
  selector: 'app-sign-in-form',
  imports: [ReactiveFormsModule, RouterLink, FormField],
  templateUrl: './sign-in-form.html',
  styleUrl: '../sign-up-form/sign-up-form.scss',
})
export class SignInForm implements OnInit, OnChanges {
  @Input() email = '';
  @Input() pending = false;
  @Input() error: SignInErrorReason | null = null;
  @Output() submitted = new EventEmitter<SignInRequest>();

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly controls = this.form.controls;

  get errorMessage(): string | null {
    return this.error ? SIGN_IN_ERROR_MESSAGES[this.error] : null;
  }

  ngOnInit(): void {
    this.controls.email.setValue(this.email);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pending']) {
      if (this.pending) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    if (this.pending || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.submitted.emit({ email: email.trim().toLowerCase(), password });
  }
}
