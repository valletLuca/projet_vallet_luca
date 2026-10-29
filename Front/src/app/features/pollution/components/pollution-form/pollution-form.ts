import {
  afterNextRender,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField } from '../../../../shared/ui/form-field/form-field';
import { StepperStep } from '../../../../shared/ui/stepper-header/stepper-header';
import {
  PhotoSource,
  POLLUTION_TYPES,
  PollutionDeclaration,
  PollutionType,
} from '../../models/pollution.model';
import { formatFileSize } from '../../utils/file-size';
import { imageFileValidator, MAX_PHOTO_BYTES } from '../../validators/image-file.validator';
import { notBlankValidator } from '../../validators/not-blank.validator';
import { notInFutureValidator, todayIso } from '../../validators/not-in-future.validator';
import { validNumberValidator } from '../../validators/valid-number.validator';
import { PhotoPicker } from '../photo-picker/photo-picker';
import { PhotoPreview } from '../photo-preview/photo-preview';

/** Durée de l'animation de changement d'étape (voir pollution-form.scss). */
const STEP_TRANSITION_MS = 320;

@Component({
  selector: 'app-pollution-form',
  imports: [ReactiveFormsModule, FormField, PhotoPicker, PhotoPreview],
  templateUrl: './pollution-form.html',
  styleUrl: './pollution-form.scss',
})
export class PollutionForm implements OnInit, OnChanges {
  @Input({ required: true }) steps!: readonly StepperStep[];
  @Input() currentStep = 0;
  @Input() initialValue: PollutionDeclaration | null = null;
  @Input() autoFocus = false;
  @Input() editing = false;
  /** Requête d'enregistrement en cours : la soumission est bloquée. */
  @Input() saving = false;
  @Output() stepChange = new EventEmitter<number>();
  @Output() declared = new EventEmitter<PollutionDeclaration>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly types = POLLUTION_TYPES;
  protected readonly today = todayIso();
  protected direction: 'forward' | 'backward' = 'forward';

  // Empêche un double-clic sur « Suivant » de valider aussitôt l'étape suivante
  // (le bouton « Déclarer » apparaît au même endroit).
  private transitioning = false;

  readonly form = new FormGroup({
    what: new FormGroup({
      title: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          notBlankValidator(),
          Validators.minLength(5),
          Validators.maxLength(80),
        ],
      }),
      type: new FormControl<PollutionType | ''>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          notBlankValidator(),
          Validators.minLength(20),
          Validators.maxLength(1000),
        ],
      }),
    }),
    where: new FormGroup({
      observedAt: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, notInFutureValidator()],
      }),
      place: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, notBlankValidator()],
      }),
      latitude: new FormControl<number | null>(null, {
        validators: [Validators.required, validNumberValidator()],
      }),
      longitude: new FormControl<number | null>(null, {
        validators: [Validators.required, validNumberValidator()],
      }),
    }),
    evidence: new FormGroup({
      source: new FormControl<PhotoSource>('url', { nonNullable: true }),
      photoUrl: new FormControl('', { nonNullable: true }),
      // Désactivé tant que la source « url » est sélectionnée (voir applyPhotoSource).
      photoFile: new FormControl<File | null>(
        { value: null, disabled: true },
        { validators: [imageFileValidator(MAX_PHOTO_BYTES)] },
      ),
    }),
  });

  protected readonly what = this.form.controls.what.controls;
  protected readonly where = this.form.controls.where.controls;
  protected readonly evidence = this.form.controls.evidence.controls;

  get isLastStep(): boolean {
    return this.currentStep === this.steps.length - 1;
  }

  get photoFileError(): string | null {
    const control = this.evidence.photoFile;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['imageType']) {
      return 'Le fichier doit être une image.';
    }
    const { actualSize } = control.errors['imageTooLarge'];
    return `L'image dépasse ${formatFileSize(MAX_PHOTO_BYTES)} (${formatFileSize(actualSize)}).`;
  }

  get currentGroup() {
    const { what, where, evidence } = this.form.controls;
    return [what, where, evidence][this.currentStep];
  }

  ngOnInit(): void {
    if (this.initialValue) {
      const { title, type, description, observedAt, place, latitude, longitude, photoUrl } =
        this.initialValue;
      this.form.setValue({
        what: { title, type, description },
        where: { observedAt, place, latitude, longitude },
        evidence: {
          source: this.initialValue.photoFile ? 'upload' : 'url',
          photoUrl: photoUrl ?? '',
          photoFile: this.initialValue.photoFile,
        },
      });
    }
    this.applyPhotoSource();
    if (this.autoFocus) {
      afterNextRender(() => this.focusFirstField(), { injector: this.injector });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const step = changes['currentStep'];
    if (step && !step.firstChange) {
      this.direction = step.currentValue > step.previousValue ? 'forward' : 'backward';
      this.transitioning = true;
      setTimeout(() => (this.transitioning = false), STEP_TRANSITION_MS);
      afterNextRender(() => this.focusFirstField(), { injector: this.injector });
    }
  }

  /** Seule la source choisie est validée : l'autre contrôle est désactivé, sa valeur conservée. */
  applyPhotoSource(): void {
    const { source, photoFile, photoUrl } = this.evidence;
    if (source.value === 'upload') {
      photoFile.enable();
      photoUrl.disable();
    } else {
      photoUrl.enable();
      photoFile.disable();
    }
  }

  onPhotoFileChange(file: File | null): void {
    this.evidence.photoFile.setValue(file);
    this.evidence.photoFile.markAsTouched();
  }

  previous(): void {
    if (this.currentStep > 0) {
      this.stepChange.emit(this.currentStep - 1);
    }
  }

  onSubmit(): void {
    if (this.transitioning) {
      return;
    }

    if (!this.isLastStep) {
      if (this.currentGroup.valid) {
        this.stepChange.emit(this.currentStep + 1);
      }
      return;
    }

    // Verrou de soumission : le bouton est désactivé, mais on revérifie côté code.
    if (this.form.invalid || this.saving) {
      return;
    }
    this.declared.emit(this.toDeclaration());
  }

  private toDeclaration(): PollutionDeclaration {
    const { what, where, evidence } = this.form.getRawValue();
    return {
      title: what.title.trim(),
      type: what.type as PollutionType,
      description: what.description.trim(),
      observedAt: where.observedAt,
      place: where.place.trim(),
      latitude: Number(where.latitude),
      longitude: Number(where.longitude),
      photoUrl: evidence.source === 'url' ? evidence.photoUrl.trim() || null : null,
      photoFile: evidence.source === 'upload' ? evidence.photoFile : null,
    };
  }

  private focusFirstField(): void {
    this.host.nativeElement
      .querySelector<HTMLElement>(`[data-step="${this.currentStep}"] :is(input, select, textarea)`)
      ?.focus();
  }
}
