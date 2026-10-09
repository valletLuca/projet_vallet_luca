import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { formatFileSize } from '../../utils/file-size';
import { PhotoPreview } from '../photo-preview/photo-preview';

@Component({
  selector: 'app-photo-picker',
  imports: [PhotoPreview],
  templateUrl: './photo-picker.html',
  styleUrl: './photo-picker.scss',
})
export class PhotoPicker implements OnChanges, OnDestroy {
  @Input() file: File | null = null;
  @Input() error: string | null = null;
  @Input() inputId = 'photoFile';
  @Output() fileChange = new EventEmitter<File | null>();

  protected previewUrl: string | null = null;
  protected dragging = false;

  get fileSize(): string {
    return this.file ? formatFileSize(this.file.size) : '';
  }

  ngOnChanges(): void {
    this.revokePreview();
    if (this.file) {
      this.previewUrl = URL.createObjectURL(this.file);
    }
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permet de re-sélectionner le même fichier
    if (file) {
      this.fileChange.emit(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.fileChange.emit(file);
    }
  }

  remove(): void {
    this.fileChange.emit(null);
  }

  private revokePreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
  }
}
