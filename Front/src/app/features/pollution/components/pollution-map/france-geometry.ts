/** Contours simplifiés de la France métropolitaine, en [longitude, latitude]. */
export type LonLat = readonly [number, number];

export const MAINLAND: readonly LonLat[] = [
  [2.55, 51.08], [3.1, 50.78], [4.15, 49.98], [4.85, 50.15], [5.9, 49.5], [6.4, 49.47],
  [7.6, 49.05], [8.2, 48.97], [7.6, 47.6], [7.0, 47.45], [6.1, 46.6], [6.1, 46.15],
  [6.8, 46.4], [7.0, 45.9], [6.6, 45.1], [7.1, 44.6], [7.5, 43.8], [6.6, 43.15],
  [5.4, 43.2], [4.6, 43.4], [3.2, 43.0], [3.05, 42.45], [1.7, 42.5], [0.0, 42.7],
  [-1.75, 43.35], [-1.25, 44.6], [-1.15, 45.6], [-2.2, 47.25], [-3.2, 47.5], [-4.4, 47.8],
  [-4.75, 48.3], [-4.6, 48.65], [-3.5, 48.85], [-2.5, 48.6], [-1.6, 48.65], [-1.6, 49.25],
  [-1.95, 49.72], [-1.25, 49.7], [-0.2, 49.3], [0.1, 49.5], [1.5, 50.1],
  [1.6, 50.95],
];

export const CORSICA: readonly LonLat[] = [
  [9.4, 43.0], [9.55, 42.1], [9.2, 41.37], [8.6, 41.9], [8.7, 42.6],
];

/** Emprise de la carte (Corse comprise). */
export const BOUNDS = { west: -5.2, east: 9.8, north: 51.3, south: 41.2 } as const;

/** Lancer de rayon : le point est-il à l'intérieur du polygone ? */
export function isInside([lon, lat]: LonLat, polygon: readonly LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
