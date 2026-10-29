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

export interface PollutionDeclaration {
  title: string;
  type: PollutionType;
  description: string;
  observedAt: string;
  place: string;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  /** Fichier importé depuis l'appareil, envoyé à l'API en `FormData` (voir PollutionService). */
  photoFile: File | null;
}

/** Pollution telle que renvoyée par l'API : la photo importée est devenue une URL. */
export interface Pollution extends Omit<PollutionDeclaration, 'photoFile'> {
  id: number;
  createdAt: string;
}

export function pollutionTypeLabel(type: PollutionType): string {
  return POLLUTION_TYPES.find((t) => t.value === type)?.label ?? type;
}
