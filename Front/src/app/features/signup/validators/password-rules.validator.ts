import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  { id: 'length', label: '8 caractères minimum', test: (v) => v.length >= 8 },
  { id: 'uppercase', label: 'Une lettre majuscule', test: (v) => /[A-Z]/.test(v) },
  { id: 'digit', label: 'Un chiffre', test: (v) => /\d/.test(v) },
  { id: 'special', label: 'Un caractère spécial', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

@Directive({
  selector: '[appPasswordRules][ngModel]',
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordRulesValidator, multi: true }],
})
export class PasswordRulesValidator implements Validator {
  validate(control: AbstractControl<string | null>): ValidationErrors | null {
    const value = control.value ?? '';
    if (!value) {
      return null; // le cas « vide » est géré par `required`
    }
    const failed = PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.id);
    return failed.length ? { passwordRules: { failed } } : null;
  }
}
