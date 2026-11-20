import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-up-result',
  imports: [RouterLink],
  templateUrl: './sign-up-result.html',
  styleUrl: './sign-up-result.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpResult {
  @Input({ required: true }) firstName!: string;
  @Input({ required: true }) email!: string;
}
