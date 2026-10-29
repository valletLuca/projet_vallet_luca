import { Component, computed, DestroyRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ConfirmDialog } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { PageState } from '../../../shared/ui/page-state/page-state';
import { PollutionBreakdown } from '../components/pollution-breakdown/pollution-breakdown';
import { PollutionCard } from '../components/pollution-card/pollution-card';
import { PollutionFilterBar } from '../components/pollution-filter-bar/pollution-filter-bar';
import { PollutionMap } from '../components/pollution-map/pollution-map';
import { PollutionTimeline } from '../components/pollution-timeline/pollution-timeline';
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  matchesFilters,
  PollutionFilters,
} from '../models/pollution-filters';
import { Pollution, PollutionType } from '../models/pollution.model';
import { PollutionService } from '../services/pollution.service';

type LoadStatus = 'loading' | 'ready' | 'error';
type ListView = 'grid' | 'timeline';

/** Nombre de cartes fantômes affichées pendant le chargement. */
const SKELETON_COUNT = 6;
/** Clé de stockage local de la vue choisie (préférence du visiteur). */
const VIEW_STORAGE_KEY = 'sillage.pollutions.view';

@Component({
  selector: 'app-pollution-list-page',
  imports: [
    RouterLink,
    ConfirmDialog,
    PageState,
    PollutionBreakdown,
    PollutionCard,
    PollutionFilterBar,
    PollutionMap,
    PollutionTimeline,
  ],
  templateUrl: './pollution-list-page.html',
  styleUrl: './pollution-list-page.scss',
})
export class PollutionListPage implements OnInit {
  private readonly pollutionService = inject(PollutionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(PollutionFilterBar) private filterBar?: PollutionFilterBar;

  protected readonly skeletons = Array.from({ length: SKELETON_COUNT }, (_, i) => i);
  protected readonly status = signal<LoadStatus>('loading');
  protected readonly pollutions = signal<Pollution[]>([]);
  protected readonly filters = signal<PollutionFilters>(EMPTY_FILTERS);
  protected readonly view = signal<ListView>(readStoredView());
  /** Pollution survolée, synchronisée entre la carte et la liste. */
  protected readonly activeId = signal<number | null>(null);

  /** Les plus récentes d'abord. */
  protected readonly filtered = computed(() =>
    this.pollutions()
      .filter((pollution) => matchesFilters(pollution, this.filters()))
      .sort((a, b) => b.observedAt.localeCompare(a.observedAt) || b.id - a.id),
  );
  protected readonly visibleIds = computed(() => new Set(this.filtered().map((p) => p.id)));
  protected readonly filtering = computed(() => hasActiveFilters(this.filters()));
  protected readonly resultLabel = computed(() => {
    const count = this.filtered().length;
    const label = `${count} ${count > 1 ? 'signalements' : 'signalement'}`;
    return this.filtering() ? `${label} sur ${this.pollutions().length}` : label;
  });

  // Suppression : pollution en attente de confirmation, requête en cours, erreur éventuelle.
  protected readonly pendingDelete = signal<Pollution | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status.set('loading');
    this.pollutionService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pollutions) => {
          this.pollutions.set(pollutions);
          this.status.set('ready');
        },
        error: () => this.status.set('error'),
      });
  }

  onFiltersChange(filters: PollutionFilters): void {
    this.filters.set(filters);
  }

  onTypeToggle(type: PollutionType): void {
    this.filterBar?.toggleType(type);
  }

  resetFilters(): void {
    this.filterBar?.reset();
  }

  openPollution(id: number): void {
    this.router.navigate(['/pollutions', id]);
  }

  setView(view: ListView): void {
    this.view.set(view);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch {
      // Stockage indisponible (navigation privée…) : le choix ne sera simplement pas retenu.
    }
  }

  askDelete(pollution: Pollution): void {
    this.deleteError.set(null);
    this.pendingDelete.set(pollution);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  confirmDelete(): void {
    const pollution = this.pendingDelete();
    if (!pollution || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    this.deleteError.set(null);
    this.pollutionService
      .delete(pollution.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.pollutions.update((list) => list.filter((p) => p.id !== pollution.id));
          this.notice.set(`« ${pollution.title} » a été supprimé.`);
          this.activeId.set(null);
          this.deleting.set(false);
          this.pendingDelete.set(null);
        },
        error: () => {
          this.deleteError.set('La suppression a échoué. Veuillez réessayer.');
          this.deleting.set(false);
        },
      });
  }
}

function readStoredView(): ListView {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === 'timeline' ? 'timeline' : 'grid';
  } catch {
    return 'grid';
  }
}
