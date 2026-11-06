import { Pollution, pollutionTypeLabel, PollutionType } from './pollution.model';

export interface PollutionFilters {
  search: string;
  type: PollutionType | '';
  from: string;
  to: string;
}

export const EMPTY_FILTERS: PollutionFilters = { search: '', type: '', from: '', to: '' };

export function hasActiveFilters(filters: PollutionFilters): boolean {
  return Object.values(filters).some((value) => value.trim() !== '');
}

export function matchesFilters(pollution: Pollution, filters: PollutionFilters): boolean {
  const { search, type, from, to } = filters;
  if (type && pollution.type !== type) {
    return false;
  }
  if ((from && pollution.observedAt < from) || (to && pollution.observedAt > to)) {
    return false;
  }
  const query = normalize(search.trim());
  if (!query) {
    return true;
  }
  const searchable = [
    pollution.title,
    pollution.place,
    pollution.description,
    pollutionTypeLabel(pollution.type),
  ];
  return searchable.some((text) => normalize(text).includes(query));
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
