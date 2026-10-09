import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  // Les styles doivent atteindre le champ projeté : classes préfixées `field`.
  encapsulation: ViewEncapsulation.None,
})
export class FormField {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) fieldId!: string;
  @Input({ required: true }) control!: AbstractControl;
  @Input() messages: Record<string, string> = {};
  @Input() optional = false;
  @Input() minLength?: number;
  @Input() maxLength?: number;

  get errorMessage(): string | null {
    const errors = this.control.errors;
    if (!errors || !this.control.touched) {
      return null;
    }
    const firstKey = Object.keys(errors)[0];
    return this.messages[firstKey] ?? 'Ce champ est invalide.';
  }

  get length(): number {
    return String(this.control.value ?? '').length;
  }

  get belowMinLength(): boolean {
    return this.minLength !== undefined && this.length > 0 && this.length < this.minLength;
  }
}
