import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Complète `Validators.required` : une saisie composée uniquement d'espaces est refusée. */
export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value ?? '';
    return value.length > 0 && value.trim().length === 0 ? { required: true } : null;
  };
}
