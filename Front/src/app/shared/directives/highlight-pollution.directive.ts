import { Directive, Input } from '@angular/core';
import { PollutionLevel, toPollutionLevel } from '../../features/pollution/models/pollution-level';

export const POLLUTION_LEVEL_COLORS: Record<PollutionLevel, string> = {
  Faible: 'lightgreen',
  Modérée: 'yellow',
  Élevée: 'orange',
  Dangereuse: 'red',
};

@Directive({
  selector: '[appHighlightPollution]',
  host: {
    '[style.background-color]': 'backgroundColor',
  },
})
export class HighlightPollutionDirective {
  @Input({ required: true }) appHighlightPollution: number | null | undefined;

  get backgroundColor(): string | null {
    const level = toPollutionLevel(this.appHighlightPollution);
    return level ? POLLUTION_LEVEL_COLORS[level] : null;
  }
}
