import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { EMPTY_FILTERS, hasActiveFilters, PollutionFilters } from '../../models/pollution-filters';
import { POLLUTION_TYPES, PollutionType } from '../../models/pollution.model';

/** Délai avant de filtrer, pour laisser finir la frappe dans la recherche. */
const SEARCH_DEBOUNCE_MS = 150;

@Component({
  selector: 'app-pollution-filter-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './pollution-filter-bar.html',
  styleUrl: './pollution-filter-bar.scss',
})
export class PollutionFilterBar implements OnInit {
  @Output() filtersChange = new EventEmitter<PollutionFilters>();

  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('searchInput', { static: true })
  private searchInput!: ElementRef<HTMLInputElement>;

  protected readonly types = POLLUTION_TYPES;

  readonly form = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
    type: new FormControl<PollutionType | ''>('', { nonNullable: true }),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
  });

  get active(): boolean {
    return hasActiveFilters(this.form.getRawValue());
  }

  ngOnInit(): void {
    this.form.valueChanges
      .pipe(
        map(() => this.form.getRawValue()),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filters) => this.filtersChange.emit(filters));
  }

  reset(): void {
    this.form.reset(EMPTY_FILTERS);
  }

  /** Filtre sur un type, ou retire le filtre si ce type est déjà sélectionné. */
  toggleType(type: PollutionType): void {
    const { type: control } = this.form.controls;
    control.setValue(control.value === type ? '' : type);
  }

  /** Raccourci « / » : place le curseur dans la recherche, sauf pendant une saisie. */
  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const typing = target.closest('input, textarea, select, [contenteditable="true"]');
    if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      this.searchInput.nativeElement.focus();
    }
  }
}
