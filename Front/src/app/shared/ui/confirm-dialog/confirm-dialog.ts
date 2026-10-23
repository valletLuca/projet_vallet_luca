import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';

let nextId = 0;

/** Boîte de confirmation modale basée sur l'élément natif `<dialog>` (focus et Échap gérés). */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog implements OnChanges {
  @Input() open = false;
  @Input({ required: true }) heading!: string;
  @Input() message = '';
  @Input() confirmLabel = 'Confirmer';
  @Input() busyLabel = 'Patientez…';
  @Input() busy = false;
  @Input() error: string | null = null;
  @Output() confirmed = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  @ViewChild('dialog', { static: true }) private dialog!: ElementRef<HTMLDialogElement>;

  protected readonly dialogId = `confirm-dialog-${nextId++}`;

  ngOnChanges(): void {
    const dialog = this.dialog.nativeElement;
    if (this.open && !dialog.open) {
      dialog.showModal();
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  /** Touche Échap : c'est le parent qui ferme, via `open`. */
  onCancel(event: Event): void {
    event.preventDefault();
    if (!this.busy) {
      this.dismissed.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog.nativeElement && !this.busy) {
      this.dismissed.emit();
    }
  }
}
