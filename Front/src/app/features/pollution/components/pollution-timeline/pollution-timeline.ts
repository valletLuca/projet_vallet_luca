import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pollution, pollutionTypeLabel, PollutionType } from '../../models/pollution.model';

interface MonthGroup {
  /** Premier jour du mois, `yyyy-MM-01`. */
  month: string;
  pollutions: Pollution[];
}

/** Vue chronologique : signalements regroupés par mois d'observation, déjà triés par le parent. */
@Component({
  selector: 'app-pollution-timeline',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './pollution-timeline.html',
  styleUrl: './pollution-timeline.scss',
})
export class PollutionTimeline implements OnChanges {
  @Input({ required: true }) pollutions!: readonly Pollution[];
  @Input() activeId: number | null = null;
  @Output() activeIdChange = new EventEmitter<number | null>();
  @Output() remove = new EventEmitter<Pollution>();

  protected groups: MonthGroup[] = [];

  ngOnChanges(): void {
    const groups = new Map<string, Pollution[]>();
    for (const pollution of this.pollutions) {
      const month = `${pollution.observedAt.slice(0, 7)}-01`;
      groups.set(month, [...(groups.get(month) ?? []), pollution]);
    }
    this.groups = [...groups].map(([month, pollutions]) => ({ month, pollutions }));
  }

  typeLabel(type: PollutionType): string {
    return pollutionTypeLabel(type);
  }
}
