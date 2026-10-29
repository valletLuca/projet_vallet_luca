import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pollution, pollutionTypeLabel } from '../../models/pollution.model';
import { PhotoPreview } from '../photo-preview/photo-preview';

/** Carte d'une pollution dans la liste : lien vers le détail et bouton de suppression. */
@Component({
  selector: 'app-pollution-card',
  imports: [DatePipe, RouterLink, PhotoPreview],
  templateUrl: './pollution-card.html',
  styleUrl: './pollution-card.scss',
})
export class PollutionCard {
  @Input({ required: true }) pollution!: Pollution;
  /** Mise en avant, quand son épingle est survolée sur la carte. */
  @Input() active = false;
  @Output() remove = new EventEmitter<Pollution>();

  get typeLabel(): string {
    return pollutionTypeLabel(this.pollution.type);
  }
}
