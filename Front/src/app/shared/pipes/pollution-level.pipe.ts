import { Pipe, PipeTransform } from '@angular/core';
import { PollutionLevel, toPollutionLevel } from '../../features/pollution/models/pollution-level';

@Pipe({ name: 'pollutionLevel' })
export class PollutionLevelPipe implements PipeTransform {
  transform(index: number | null | undefined, fallback = 'Non évaluée'): PollutionLevel | string {
    return toPollutionLevel(index) ?? fallback;
  }
}
