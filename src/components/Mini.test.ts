import { describe, expect, it } from 'vitest';
import type { Vehicle } from '../types';
import { order } from './Mini';

const car = (stock: string, year: number, price: number): Vehicle => ({
  stock,
  vin: '',
  year,
  make: 'Make',
  model: 'Model',
  trim: '',
  body: 'Sedan',
  price,
  mileage: 0,
  mpgCity: 30,
  mpgHwy: 30,
  drivetrain: '',
  exteriorColor: '',
  features: [],
  photoUrl: '',
  vdpUrl: 'https://dealer.example/' + stock,
});

describe('mini order', () => {
  it('leads with the newest model year, cheapest first within a year, without touching the lot', () => {
    const lot = [car('a', 2019, 20000), car('b', 2021, 30000), car('c', 2021, 25000), car('d', 2015, 5000)];
    expect(order(lot).map((v) => v.stock)).toEqual(['c', 'b', 'a', 'd']);
    expect(lot.map((v) => v.stock)).toEqual(['a', 'b', 'c', 'd']);
  });
});
