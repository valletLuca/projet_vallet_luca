import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField implements OnChanges {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) fieldId!: string;
  @Input({ required: true }) control!: AbstractControl;
  @Input() messages: Record<string, string> = {};
  @Input() optional = false;
  @Input() minLength?: number;
  @Input() maxLength?: number;

  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private controlEvents?: Subscription;

  /**
   * En OnPush, le champ n'est rafraîchi que si ses entrées changent. Or le contrôle reste
   * le même objet quand sa valeur, sa validité ou son état « touché » évoluent (saisie,
   * `markAllAsTouched()` du formulaire parent…) : on écoute donc ses événements.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['control']) {
      this.controlEvents?.unsubscribe();
      this.controlEvents = this.control.events
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.changeDetector.markForCheck());
    }
  }

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
