import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-up-result',
  imports: [RouterLink],
  templateUrl: './sign-up-result.html',
  styleUrl: './sign-up-result.scss',
})
export class SignUpResult {
  @Input({ required: true }) firstName!: string;
  @Input({ required: true }) email!: string;
}
