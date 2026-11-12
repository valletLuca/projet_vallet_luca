import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const HEIC_EXTENSION = /\.(heic|heif)$/i;

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
