import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Erreur `invalidNumber` si la valeur n'est pas un nombre fini. */
export function validNumberValidator(): ValidatorFn {
  return (control: AbstractControl<number | null>): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || (value as unknown) === '') {
      return null;
    }
    return Number.isFinite(Number(value)) ? null : { invalidNumber: true };
  };
}
