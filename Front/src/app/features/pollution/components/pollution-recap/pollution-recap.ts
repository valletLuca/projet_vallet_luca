import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Pollution, pollutionTypeLabel } from '../../models/pollution.model';
import { PhotoPreview } from '../photo-preview/photo-preview';

/** Fiche d'une pollution. Les boutons d'action sont projetés par le parent. */
@Component({
  selector: 'app-pollution-recap',
  imports: [DatePipe, DecimalPipe, PhotoPreview],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.scss',
})
export class PollutionRecap {
  @Input({ required: true }) pollution!: Pollution;
  /** Message de confirmation affiché au-dessus du titre (ex. après un enregistrement). */
  @Input() status: string | null = null;

  get typeLabel(): string {
    return pollutionTypeLabel(this.pollution.type);
  }

  get mapUrl(): string {
    const { latitude, longitude } = this.pollution;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  }
}
