import { FUEL } from '../config/wisconsin';
import { quote, type LoanInputs } from './loan';

// EPA combined economy: 55% city / 45% highway, harmonically weighted.
export function combinedMpg(mpgCity: number, mpgHwy: number): number {
  if (mpgCity <= 0 || mpgHwy <= 0) throw new Error(`mpg must be positive, got ${mpgCity}/${mpgHwy}`);
  return 1 / (0.55 / mpgCity + 0.45 / mpgHwy);
}

export function fuelPerMonth(mpgCity: number, mpgHwy: number): number {
  return (FUEL.milesPerMonth / combinedMpg(mpgCity, mpgHwy)) * FUEL.gasPrice;
}

// What a vehicle costs a month to finance and to fuel, together — where an
// old SUV's low payment and high gas bill meet.
export function allInMonthly(v: { price: number; mpgCity: number; mpgHwy: number }, i: LoanInputs): number {
  return quote(v.price, i).payment + fuelPerMonth(v.mpgCity, v.mpgHwy);
}
