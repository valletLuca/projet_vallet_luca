import { Component } from '@angular/core';
import { APP_BRAND } from '../../const/brand.const';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  protected readonly brand = APP_BRAND;
}
