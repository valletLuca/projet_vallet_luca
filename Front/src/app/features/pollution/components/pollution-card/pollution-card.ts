import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HighlightPollutionDirective } from '../../../../shared/directives/highlight-pollution.directive';
import { PollutionLevelPipe } from '../../../../shared/pipes/pollution-level.pipe';
import { Pollution, pollutionTypeLabel } from '../../models/pollution.model';
import { PhotoPreview } from '../photo-preview/photo-preview';

@Component({
  selector: 'app-pollution-card',
  imports: [DatePipe, RouterLink, PhotoPreview, PollutionLevelPipe, HighlightPollutionDirective],
  templateUrl: './pollution-card.html',
  styleUrl: './pollution-card.scss',
})
export class PollutionCard {
  @Input({ required: true }) pollution!: Pollution;
  @Input() active = false;
  @Output() remove = new EventEmitter<Pollution>();

  get typeLabel(): string {
    return pollutionTypeLabel(this.pollution.type);
  }
}
