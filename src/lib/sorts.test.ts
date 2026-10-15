import { describe, expect, it } from 'vitest';
import type { Vehicle } from '../types';
import { allInMonthly } from './fuel';
import { SORT_KEYS, isSortKey, sortVehicles } from './sorts';

const i = { monthlyIncome: 5000, paymentShare: 0.1, downPayment: 2000, tradeValue: 0, tradeOwed: 0, apr: 0.069, termMonths: 60 };
const car = (stock: string, price: number, mpg: number, mileage: number, year: number): Vehicle => ({
  stock,
  vin: '',
  year,
  make: 'M',
  model: 'X',
  trim: '',
  body: 'Sedan',
  price,
  mileage,
  mpgCity: mpg,
  mpgHwy: mpg,
  fuel: 'Gasoline',
  drivetrain: '',
  exteriorColor: '',
  features: [],
  photoUrl: '',
  vdpUrl: 'https://dealer.example/' + stock,
});
// A cheap thirsty SUV, a dearer frugal sedan, and a twin of the sedan with more miles.
const lot = [car('suv', 8000, 17, 150_000, 2016), car('sedan', 12000, 34, 60_000, 2019), car('twin', 12000, 34, 90_000, 2021)];
const order = (key: Parameters<typeof sortVehicles>[1]) => sortVehicles(lot, key, i).map((v) => v.stock);

describe('sortVehicles', () => {
  it('orders by payment, with gas, miles, mpg and year, ties by price', () => {
    expect(order('price')).toEqual(['suv', 'sedan', 'twin']);
    expect(order('mileage')).toEqual(['sedan', 'twin', 'suv']);
    expect(order('mpg')).toEqual(['sedan', 'twin', 'suv']);
    expect(order('year')).toEqual(['twin', 'sedan', 'suv']);
  });
  it('puts the frugal sedan ahead of the thirsty SUV once gas is counted', () => {
    expect(allInMonthly(lot[1], i)).toBeLessThan(allInMonthly(lot[0], i));
    expect(order('allin')).toEqual(['sedan', 'twin', 'suv']);
  });
  it('leaves the lot it was given alone', () => {
    sortVehicles(lot, 'year', i);
    expect(lot.map((v) => v.stock)).toEqual(['suv', 'sedan', 'twin']);
  });
  it('knows its own keys', () => {
    expect(SORT_KEYS).toEqual(['price', 'allin', 'mileage', 'mpg', 'year']);
    expect(isSortKey('allin')).toBe(true);
    expect(isSortKey('cheapest')).toBe(false);
  });
});
