import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';


@Directive({
  selector: '[appMatchPassword][ngModel]',
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchPasswordValidator, multi: true }],
})
export class MatchPasswordValidator implements Validator, OnChanges {
  @Input('appMatchPassword') password = '';

  private onValidatorChange?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    // Le mot de passe de référence a changé : on relance la validation de la confirmation.
    if (changes['password'] && !changes['password'].firstChange) {
      this.onValidatorChange?.();
    }
  }

  validate(control: AbstractControl<string | null>): ValidationErrors | null {
    const value = control.value ?? '';
    if (!value) {
      return null; // le cas « vide » est géré par `required`
    }
    return value === this.password ? null : { passwordMismatch: true };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }
}
