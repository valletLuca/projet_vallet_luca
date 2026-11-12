export type PollutionLevel = 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse';

/** Bornes hautes incluses : 0-20 Faible, 21-50 Modérée, 51-100 Élevée, 101+ Dangereuse. */
const LEVEL_THRESHOLDS: readonly { max: number; level: PollutionLevel }[] = [
  { max: 20, level: 'Faible' },
  { max: 50, level: 'Modérée' },
  { max: 100, level: 'Élevée' },
];

/** Niveau correspondant à un indice de dangerosité, ou `null` si l'indice est absent ou invalide. */
export function toPollutionLevel(index: number | null | undefined): PollutionLevel | null {
  if (index == null || !Number.isFinite(index) || index < 0) {
    return null;
  }
  return LEVEL_THRESHOLDS.find((threshold) => index <= threshold.max)?.level ?? 'Dangereuse';
}
