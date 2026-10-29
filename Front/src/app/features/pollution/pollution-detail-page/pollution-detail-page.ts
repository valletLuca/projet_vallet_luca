import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, Input, OnChanges, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { PollutionRecap } from '../components/pollution-recap/pollution-recap';
import { Pollution } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';

type DetailStatus = 'loading' | 'ready' | 'not-found' | 'error';

/** Transmis par la page de déclaration via l'état de navigation. */
export type SavedState = 'created' | 'updated';

const SAVED_MESSAGES: Record<SavedState, string> = {
  created: 'Déclaration enregistrée',
  updated: 'Modifications enregistrées',
};

@Component({
  selector: 'app-pollution-detail-page',
  imports: [RouterLink, ConfirmDialog, PageState, PollutionRecap],
  templateUrl: './pollution-detail-page.html',
  styleUrl: './pollution-detail-page.scss',
})
export class PollutionDetailPage implements OnChanges {
  /** Paramètre de route `:id`. */
  @Input({ required: true }) id!: string;

  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private request?: Subscription;

  protected readonly status = signal<DetailStatus>('loading');
  protected readonly pollution = signal<Pollution | null>(null);
  protected readonly savedMessage: string | null;

  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  constructor() {
    const saved = this.router.currentNavigation()?.extras.state?.['saved'] as SavedState | undefined;
    this.savedMessage = saved ? SAVED_MESSAGES[saved] : null;
  }

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.id);
    if (!Number.isInteger(id)) {
      this.status.set('not-found');
      return;
    }
    this.status.set('loading');
    this.request?.unsubscribe();
    this.request = this.pollutionService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pollution) => {
          this.pollution.set(pollution);
          this.status.set('ready');
        },
        error: (error: HttpErrorResponse) =>
          this.status.set(error.status === 404 ? 'not-found' : 'error'),
      });
  }

  askDelete(): void {
    this.deleteError.set(null);
    this.confirmingDelete.set(true);
  }

  confirmDelete(): void {
    const pollution = this.pollution();
    if (!pollution || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    this.pollutionService
      .delete(pollution.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.confirmingDelete.set(false);
          this.router.navigate(['/pollutions']);
        },
        error: () => {
          this.deleteError.set('La suppression a échoué. Veuillez réessayer.');
          this.deleting.set(false);
        },
      });
  }
}
