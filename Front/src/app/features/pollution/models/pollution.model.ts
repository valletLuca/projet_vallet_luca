export const POLLUTION_TYPES = [
  { value: 'plastique', label: 'Plastique' },
  { value: 'chimique', label: 'Chimique' },
  { value: 'depot-sauvage', label: 'Dépôt sauvage' },
  { value: 'eau', label: 'Eau' },
  { value: 'air', label: 'Air' },
  { value: 'autre', label: 'Autre' },
] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number]['value'];

export type PhotoSource = 'upload' | 'url';

export const DANGER_LEVEL_MIN = 0;
export const DANGER_LEVEL_MAX = 999;

export interface PollutionDeclaration {
  title: string;
  type: PollutionType;
  description: string;
  observedAt: string;
  place: string;
  latitude: number;
  longitude: number;
  /** Indice de dangerosité ; `null` pour les signalements créés avant son introduction. */
  dangerLevel: number | null;
  photoUrl: string | null;
  photoFile: File | null;
}

export interface Pollution extends Omit<PollutionDeclaration, 'photoFile'> {
  id: number;
  createdAt: string;
}

export function pollutionTypeLabel(type: PollutionType): string {
  return POLLUTION_TYPES.find((t) => t.value === type)?.label ?? type;
}
