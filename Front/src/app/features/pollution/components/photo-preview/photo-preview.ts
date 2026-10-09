import { Component, Input, OnChanges } from '@angular/core';

type PreviewStatus = 'empty' | 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-photo-preview',
  templateUrl: './photo-preview.html',
  styleUrl: './photo-preview.scss',
})
export class PhotoPreview implements OnChanges {
  @Input() url: string | null = null;
  @Input() alt = '';
  @Input() errorLabel = 'Image introuvable à cette adresse';

  protected src = '';
  protected status: PreviewStatus = 'empty';

  ngOnChanges(): void {
    const trimmed = this.url?.trim() ?? '';
    if (trimmed === this.src) {
      return;
    }
    this.src = trimmed;
    this.status = trimmed ? 'loading' : 'empty';
  }
}
