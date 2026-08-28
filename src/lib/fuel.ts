import { FUEL } from '../config/wisconsin';

// EPA combined economy: 55% city / 45% highway, harmonically weighted.
export function combinedMpg(mpgCity: number, mpgHwy: number): number {
  if (mpgCity <= 0 || mpgHwy <= 0) throw new Error(`mpg must be positive, got ${mpgCity}/${mpgHwy}`);
  return 1 / (0.55 / mpgCity + 0.45 / mpgHwy);
}

export function fuelPerMonth(mpgCity: number, mpgHwy: number): number {
  return (FUEL.milesPerMonth / combinedMpg(mpgCity, mpgHwy)) * FUEL.gasPrice;
}
