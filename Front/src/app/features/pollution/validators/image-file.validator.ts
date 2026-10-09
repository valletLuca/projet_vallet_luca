import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Certains systèmes ne renseignent pas le type MIME des photos HEIC (iPhone).
const HEIC_EXTENSION = /\.(heic|heif)$/i;

/** Erreurs : `imageType` (pas une image), `imageTooLarge` (au-delà de `maxBytes`). */
export function imageFileValidator(maxBytes: number): ValidatorFn {
  return (control: AbstractControl<File | null>): ValidationErrors | null => {
    const file = control.value;
    if (!file) {
      return null;
    }
    if (!file.type.startsWith('image/') && !HEIC_EXTENSION.test(file.name)) {
      return { imageType: true };
    }
    if (file.size > maxBytes) {
      return { imageTooLarge: { actualSize: file.size, maxSize: maxBytes } };
    }
    return null;
  };
}
