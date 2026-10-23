import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  protected readonly brand = APP_BRAND;
}
