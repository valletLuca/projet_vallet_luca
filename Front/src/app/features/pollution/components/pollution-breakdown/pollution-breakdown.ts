import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { POLLUTION_TYPES, Pollution, PollutionType } from '../../models/pollution.model';

interface TypeShare {
  value: PollutionType;
  label: string;
  count: number;
}

/** Répartition des pollutions par type, cliquable pour filtrer la liste. */
@Component({
  selector: 'app-pollution-breakdown',
  templateUrl: './pollution-breakdown.html',
  styleUrl: './pollution-breakdown.scss',
})
export class PollutionBreakdown implements OnChanges {
  @Input({ required: true }) pollutions!: readonly Pollution[];
  /** Type actuellement filtré, `''` si aucun. */
  @Input() activeType: PollutionType | '' = '';
  @Output() typeToggle = new EventEmitter<PollutionType>();

  protected shares: TypeShare[] = [];

  ngOnChanges(): void {
    this.shares = POLLUTION_TYPES.map(({ value, label }) => ({
      value,
      label,
      count: this.pollutions.filter((p) => p.type === value).length,
    }))
      .filter((share) => share.count > 0)
      .sort((a, b) => b.count - a.count);
  }
}
