import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Pollution, pollutionTypeLabel, PollutionType } from '../../models/pollution.model';
import { BOUNDS, CORSICA, isInside, LonLat, MAINLAND } from './france-geometry';

/** Projection équirectangulaire corrigée à la latitude moyenne de la France. */
const LON_SCALE = Math.cos((46.5 * Math.PI) / 180);
const PX_PER_DEGREE = 40;
/** Écart entre deux points de la trame, en pixels. */
const DOT_SPACING = 6;

export const MAP_WIDTH = (BOUNDS.east - BOUNDS.west) * LON_SCALE * PX_PER_DEGREE;
export const MAP_HEIGHT = (BOUNDS.north - BOUNDS.south) * PX_PER_DEGREE;

interface Point {
  x: number;
  y: number;
}

interface Pin extends Point {
  id: number;
  type: PollutionType;
  label: string;
  dimmed: boolean;
  delay: number;
}

function project(lon: number, lat: number): Point {
  return {
    x: (lon - BOUNDS.west) * LON_SCALE * PX_PER_DEGREE,
    y: (BOUNDS.north - lat) * PX_PER_DEGREE,
  };
}

/** Trame de points calculée une seule fois : chaque point est testé contre les contours. */
const DOTS: readonly Point[] = (() => {
  const dots: Point[] = [];
  for (let y = DOT_SPACING / 2; y < MAP_HEIGHT; y += DOT_SPACING) {
    for (let x = DOT_SPACING / 2; x < MAP_WIDTH; x += DOT_SPACING) {
      const position: LonLat = [
        BOUNDS.west + x / (LON_SCALE * PX_PER_DEGREE),
        BOUNDS.north - y / PX_PER_DEGREE,
      ];
      if (isInside(position, MAINLAND) || isInside(position, CORSICA)) {
        dots.push({ x, y });
      }
    }
  }
  return dots;
})();

/** Carte en trame de points : une épingle par pollution, colorée selon son type. */
@Component({
  selector: 'app-pollution-map',
  templateUrl: './pollution-map.html',
  styleUrl: './pollution-map.scss',
})
export class PollutionMap implements OnChanges {
  @Input({ required: true }) pollutions!: readonly Pollution[];
  /** Pollutions retenues par les filtres ; les autres sont estompées. */
  @Input({ required: true }) visibleIds!: ReadonlySet<number>;
  @Input() activeId: number | null = null;
  @Output() activeIdChange = new EventEmitter<number | null>();
  @Output() pinSelect = new EventEmitter<number>();

  protected readonly dots = DOTS;
  protected readonly mapWidth = MAP_WIDTH;
  protected readonly mapHeight = MAP_HEIGHT;
  protected readonly viewBox = `0 0 ${MAP_WIDTH.toFixed(1)} ${MAP_HEIGHT.toFixed(1)}`;
  protected pins: Pin[] = [];
  /** Signalements dont les coordonnées tombent hors de la métropole. */
  protected outside = 0;

  get activePin(): Pin | undefined {
    return this.pins.find((pin) => pin.id === this.activeId);
  }

  ngOnChanges(): void {
    const inBounds = this.pollutions.filter(
      ({ latitude, longitude }) =>
        latitude >= BOUNDS.south &&
        latitude <= BOUNDS.north &&
        longitude >= BOUNDS.west &&
        longitude <= BOUNDS.east,
    );
    this.outside = this.pollutions.length - inBounds.length;
    this.pins = inBounds
      .map((pollution, index) => ({
        ...project(pollution.longitude, pollution.latitude),
        id: pollution.id,
        type: pollution.type,
        label: `${pollution.title}, ${pollution.place} (${pollutionTypeLabel(pollution.type)})`,
        dimmed: !this.visibleIds.has(pollution.id),
        delay: index * 60,
      }))
      // Les épingles retenues sont dessinées en dernier, donc au-dessus.
      .sort((a, b) => Number(b.dimmed) - Number(a.dimmed));
  }
}
