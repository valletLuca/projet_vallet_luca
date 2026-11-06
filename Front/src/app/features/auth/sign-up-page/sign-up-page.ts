import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { SignUpForm } from '../components/sign-up-form/sign-up-form';
import { SignUpResult } from '../components/sign-up-result/sign-up-result';
import { SignUpError, SignUpErrorReason, SignUpRequest, User } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-up-page',
  imports: [RouterLink, SignUpForm, SignUpResult],
  templateUrl: './sign-up-page.html',
})
export class SignUpPage {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pending = signal(false);
  protected readonly error = signal<SignUpErrorReason | null>(null);
  protected readonly createdUser = signal<User | null>(null);

  onSubmit(request: SignUpRequest): void {
    if (this.pending()) {
      return;
    }
    this.pending.set(true);
    this.error.set(null);

    this.authService
      .signUp(request)
      .pipe(
        finalize(() => this.pending.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => this.createdUser.set(user),
        error: (error: SignUpError) => this.error.set(error.reason),
      });
  }
}
