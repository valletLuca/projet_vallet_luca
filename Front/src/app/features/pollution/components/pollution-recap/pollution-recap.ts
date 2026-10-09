import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { PollutionDeclaration, pollutionTypeLabel } from '../../models/pollution.model';
import { formatFileSize } from '../../utils/file-size';
import { PhotoPreview } from '../photo-preview/photo-preview';

@Component({
  selector: 'app-pollution-recap',
  imports: [DatePipe, DecimalPipe, PhotoPreview],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.scss',
})
export class PollutionRecap implements OnChanges, OnDestroy {
  @Input({ required: true }) pollution!: PollutionDeclaration;
  @Output() edit = new EventEmitter<void>();
  @Output() restart = new EventEmitter<void>();

  protected photoSrc: string | null = null;
  private objectUrl: string | null = null;

  get typeLabel(): string {
    return pollutionTypeLabel(this.pollution.type);
  }

  get fileSize(): string {
    return this.pollution.photoFile ? formatFileSize(this.pollution.photoFile.size) : '';
  }

  ngOnChanges(): void {
    this.revokeObjectUrl();
    if (this.pollution.photoFile) {
      this.objectUrl = URL.createObjectURL(this.pollution.photoFile);
    }
    this.photoSrc = this.objectUrl ?? this.pollution.photoUrl;
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}
