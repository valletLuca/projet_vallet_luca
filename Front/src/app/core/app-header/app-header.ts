import { Component } from '@angular/core';

export const APP_BRAND = {
  name: 'Sillage',
  tagline: 'Signalement des pollutions',
} as const;

@Component({
  selector: 'app-header',
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  protected readonly brand = APP_BRAND;
}
