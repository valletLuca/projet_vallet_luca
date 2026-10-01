import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  encapsulation: ViewEncapsulation.None,
})
export class FormField {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) fieldId!: string;
  @Input({ required: true }) control!: NgModel;
  @Input() messages: Record<string, string> = {};

  get errorMessage(): string | null {
    const errors = this.control.errors;
    if (!errors || !this.control.touched) {
      return null;
    }
    const firstKey = Object.keys(errors)[0];
    return this.messages[firstKey] ?? 'Ce champ est invalide.';
  }
}
