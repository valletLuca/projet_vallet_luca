import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sign-up-result',
  templateUrl: './sign-up-result.html',
  styleUrl: './sign-up-result.scss',
})
export class SignUpResult {
  @Input({ required: true }) firstName!: string;
}
