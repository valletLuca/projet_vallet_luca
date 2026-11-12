import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchFieldValidator(fieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const reference = control.parent?.get(fieldName);
    if (!reference || !control.value) {
      return null;
    }
    return control.value === reference.value ? null : { mismatch: true };
  };
}
