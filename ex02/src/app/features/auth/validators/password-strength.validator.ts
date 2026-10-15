import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DIGIT_PATTERN, LETTER_PATTERN } from '../../../const/validation.const';

/** Exige au moins une lettre et un chiffre (la longueur est gérée par `Validators.minLength`). */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value ?? '';
    if (value.length === 0) {
      return null;
    }
    return LETTER_PATTERN.test(value) && DIGIT_PATTERN.test(value) ? null : { passwordWeak: true };
  };
}
