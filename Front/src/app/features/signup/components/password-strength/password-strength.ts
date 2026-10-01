import { Component, Input } from '@angular/core';
import { PASSWORD_RULES } from '../../validators/password-rules.validator';

const LEVELS = ['Trop faible', 'Faible', 'Moyen', 'Bon', 'Fort'] as const;

@Component({
  selector: 'app-password-strength',
  templateUrl: './password-strength.html',
  styleUrl: './password-strength.scss',
})
export class PasswordStrength {
  @Input() password = '';

  protected readonly segments = [1, 2, 3, 4];

  get rules() {
    return PASSWORD_RULES.map((rule) => ({ ...rule, valid: rule.test(this.password) }));
  }

  get score(): number {
    return this.rules.filter((rule) => rule.valid).length;
  }

  get levelLabel(): string {
    return LEVELS[this.score];
  }
}
