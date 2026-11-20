import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SignInForm } from '../components/sign-in-form/sign-in-form';
import { REDIRECT_PARAM } from '../guards/auth.guard';
import { HOME_PATH } from '../guards/guest.guard';
import { SignInError, SignInErrorReason, SignInRequest } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sign-in-page',
  imports: [SignInForm],
  templateUrl: './sign-in-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly registeredEmail: string =
    this.router.currentNavigation()?.extras.state?.['registeredEmail'] ?? '';

  protected readonly pending = signal(false);
  protected readonly error = signal<SignInErrorReason | null>(null);

  onSubmit(request: SignInRequest): void {
    if (this.pending()) {
      return;
    }
    this.pending.set(true);
    this.error.set(null);

    this.authService
      .signIn(request)
      .pipe(
        finalize(() => this.pending.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigateByUrl(this.redirectUrl()),
        error: (error: SignInError) => this.error.set(error.reason),
      });
  }

  /** Adresse demandée avant la connexion, limitée aux chemins internes à l'application. */
  private redirectUrl(): string {
    const requested = this.route.snapshot.queryParamMap.get(REDIRECT_PARAM);
    return isInternalPath(requested) ? requested : HOME_PATH;
  }
}

function isInternalPath(url: string | null): url is string {
  return !!url && url.startsWith('/') && !url.startsWith('//');
}
