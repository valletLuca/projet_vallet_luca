import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function notInFutureValidator(): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const match = ISO_DATE.exec(value);
    if (!match) {
      return { invalidDate: true };
    }
    const [, year, month, day] = match.map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return { invalidDate: true };
    }

    return value > todayIso() ? { futureDate: true } : null;
  };
}
