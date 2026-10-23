import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, Input, OnChanges, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { StepperHeader } from '../../../shared/ui/stepper-header/stepper-header';
import { PollutionForm } from '../components/pollution-form/pollution-form';
import { Pollution, PollutionDeclaration } from '../models/pollution.model';
import { SavedState } from '../pollution-detail-page/pollution-detail-page';
import { POLLUTION_STEPS } from '../pollution-steps';
import { PollutionService } from '../services/pollution.service';

type LoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

/**
 * Création (`/pollutions/nouvelle`) ou modification (`/pollutions/:id/modifier`) d'une pollution.
 * Le mode dépend de la présence du paramètre de route `id`.
 */
@Component({
  selector: 'app-pollution-declaration-page',
  imports: [RouterLink, PageState, StepperHeader, PollutionForm],
  templateUrl: './pollution-declaration-page.html',
  styleUrl: './pollution-declaration-page.scss',
})
export class PollutionDeclarationPage implements OnChanges {
  /** Paramètre de route `:id`, absent en création. */
  @Input() id?: string;

  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly steps = POLLUTION_STEPS;
  protected readonly currentStep = signal(0);
  protected readonly status = signal<LoadStatus>('ready');
  protected readonly draft = signal<PollutionDeclaration | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  get editing(): boolean {
    return this.id !== undefined;
  }

  ngOnChanges(): void {
    this.currentStep.set(0);
    this.saveError.set(null);
    this.draft.set(null);
    if (this.editing) {
      this.load();
    } else {
      this.status.set('ready');
    }
  }

  load(): void {
    const id = Number(this.id);
    if (!Number.isInteger(id)) {
      this.status.set('not-found');
      return;
    }
    this.status.set('loading');
    this.pollutionService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pollution) => {
          this.draft.set(toDeclaration(pollution));
          this.status.set('ready');
        },
        error: (error: HttpErrorResponse) =>
          this.status.set(error.status === 404 ? 'not-found' : 'error'),
      });
  }

  onStepChange(step: number): void {
    this.currentStep.set(step);
  }

  onDeclared(declaration: PollutionDeclaration): void {
    if (this.saving()) {
      return;
    }
    const saved: SavedState = this.editing ? 'updated' : 'created';
    const request: Observable<Pollution> = this.editing
      ? this.pollutionService.update(Number(this.id), declaration)
      : this.pollutionService.create(declaration);

    this.saving.set(true);
    this.saveError.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (pollution) => this.router.navigate(['/pollutions', pollution.id], { state: { saved } }),
      error: () => {
        this.saveError.set("L'enregistrement a échoué. Vérifiez votre connexion puis réessayez.");
        this.saving.set(false);
      },
    });
  }
}

function toDeclaration(pollution: Pollution): PollutionDeclaration {
  const { id, createdAt, ...fields } = pollution;
  return { ...fields, photoFile: null };
}
