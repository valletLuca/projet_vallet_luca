import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
})
export class AppHeader {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly brand = APP_BRAND;
  protected readonly currentUser = this.authService.currentUser;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/pollutions']);
  }
}
