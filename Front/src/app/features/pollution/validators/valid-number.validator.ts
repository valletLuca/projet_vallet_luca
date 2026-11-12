import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validNumberValidator(): ValidatorFn {
  return (control: AbstractControl<number | null>): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || (value as unknown) === '') {
      return null;
    }
    return Number.isFinite(Number(value)) ? null : { invalidNumber: true };
  };
}
