import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SIGN_IN_PATH } from '../../features/auth/guards/auth.guard';
import { AuthService } from '../../features/auth/services/auth.service';

export const APP_BRAND = {
  name: 'Sillage',
  tagline: 'Signalement des pollutions',
} as const;

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly brand = APP_BRAND;
  protected readonly currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
    this.router.navigate([SIGN_IN_PATH]);
  }
}
