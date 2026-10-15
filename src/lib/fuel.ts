import { FUEL } from '../config/wisconsin';
import type { Fuel } from '../types';
import { quote, type LoanInputs } from './loan';

// EPA combined economy: 55% city / 45% highway, harmonically weighted.
export function combinedMpg(mpgCity: number, mpgHwy: number): number {
  if (mpgCity <= 0 || mpgHwy <= 0) throw new Error(`mpg must be positive, got ${mpgCity}/${mpgHwy}`);
  return 1 / (0.55 / mpgCity + 0.45 / mpgHwy);
}

// The energy in a gallon of gasoline, which is what an MPGe figure counts.
export const KWH_PER_GALLON = 33.7;

// What a "gallon" of the energy a vehicle burns costs at the Wausau pump, or
// at the Wisconsin wall socket for an electric. A hybrid runs on its gas
// mpg; a plug-in hybrid's gas-only mpg is the most it could cost, since the
// feed carries no electric share.
export function energyPrice(fuel: Fuel): number {
  switch (fuel) {
    case 'Diesel':
      return FUEL.dieselPrice;
    case 'Electric':
      return KWH_PER_GALLON * FUEL.kwhPrice;
    default:
      return FUEL.gasPrice;
  }
}

// The words the card uses: what it burns, and the rate it was priced at.
export function energyWords(fuel: Fuel): { word: string; rate: string } {
  switch (fuel) {
    case 'Diesel':
      return { word: 'diesel', rate: `Wausau’s $${FUEL.dieselPrice.toFixed(2)}/gal` };
    case 'Electric':
      return { word: 'electricity', rate: `${(FUEL.kwhPrice * 100).toFixed(1)}¢/kWh` };
    default:
      return { word: 'gas', rate: `Wausau’s $${FUEL.gasPrice.toFixed(2)}/gal` };
  }
}

export function fuelPerMonth(v: { fuel: Fuel; mpgCity: number; mpgHwy: number }): number {
  return (FUEL.milesPerMonth / combinedMpg(v.mpgCity, v.mpgHwy)) * energyPrice(v.fuel);
}

// What a vehicle costs a month to finance and to fuel, together — where an
// old SUV's low payment and high gas bill meet.
export function allInMonthly(v: { price: number; fuel: Fuel; mpgCity: number; mpgHwy: number }, i: LoanInputs): number {
  return quote(v.price, i).payment + fuelPerMonth(v);
}
