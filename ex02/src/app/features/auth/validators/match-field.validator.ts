import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Vérifie que la valeur est identique à celle du champ frère `fieldName`.
 * Le formulaire doit relancer la validation quand le champ de référence change.
 */
export function matchFieldValidator(fieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const reference = control.parent?.get(fieldName);
    if (!reference || !control.value) {
      return null;
    }
    return control.value === reference.value ? null : { mismatch: true };
  };
}
