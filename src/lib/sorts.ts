import type { Vehicle } from '../types';
import { allInMonthly, combinedMpg } from './fuel';
import type { LoanInputs } from './loan';

// Every ordering is feed data, or our math on it. Each names a key that sorts
// ascending, computed once per vehicle; ties fall back to price so the list is
// stable. Payment order is price order, so it is named for what the reader
// is looking at.
interface Sort {
  label: string;
  key: (v: Vehicle, i: LoanInputs) => number;
}

export const SORTS: Record<'price' | 'allin' | 'mileage' | 'mpg' | 'year', Sort> = {
  price: { label: 'Lowest payment', key: (v) => v.price },
  allin: { label: 'Lowest with gas', key: (v, i) => allInMonthly(v, i) },
  mileage: { label: 'Fewest miles', key: (v) => v.mileage },
  mpg: { label: 'Best mpg', key: (v) => -combinedMpg(v.mpgCity, v.mpgHwy) },
  year: { label: 'Newest', key: (v) => -v.year },
};

export type SortKey = keyof typeof SORTS;
export const SORT_KEYS = Object.keys(SORTS) as SortKey[];

export function isSortKey(s: string): s is SortKey {
  return s in SORTS;
}

export function sortVehicles(vehicles: Vehicle[], sort: SortKey, i: LoanInputs): Vehicle[] {
  const key = SORTS[sort].key;
  return vehicles
    .map((v) => ({ v, k: key(v, i) }))
    .sort((a, b) => a.k - b.k || a.v.price - b.v.price)
    .map((x) => x.v);
}
