import { describe, expect, it } from 'vitest';
import { FUEL } from '../config/wisconsin';
import { KWH_PER_GALLON, allInMonthly, combinedMpg, energyPrice, energyWords, fuelPerMonth } from './fuel';
import { quote } from './loan';

const gas = (city: number, hwy: number) => ({ fuel: 'Gasoline' as const, mpgCity: city, mpgHwy: hwy });

describe('combinedMpg', () => {
  it('is the EPA 55/45 harmonic blend', () => {
    expect(combinedMpg(30, 30)).toBeCloseTo(30, 6);
    expect(combinedMpg(20, 30)).toBeCloseTo(1 / (0.55 / 20 + 0.45 / 30), 9);
  });
  it('refuses a zero', () => {
    expect(() => combinedMpg(0, 30)).toThrow(/positive/);
  });
});

describe('fuelPerMonth', () => {
  it('is the seeded miles over combined mpg at the seeded price', () => {
    expect(fuelPerMonth(gas(25, 25))).toBeCloseTo((FUEL.milesPerMonth / 25) * FUEL.gasPrice, 6);
  });
  it('costs more for a thirstier vehicle', () => {
    expect(fuelPerMonth(gas(17, 23))).toBeGreaterThan(fuelPerMonth(gas(28, 39)));
  });
  it('prices diesel at the diesel pump and an electric at the wall', () => {
    expect(energyPrice('Diesel')).toBe(FUEL.dieselPrice);
    expect(energyPrice('Electric')).toBeCloseTo(KWH_PER_GALLON * FUEL.kwhPrice, 9);
    expect(energyPrice('Hybrid')).toBe(FUEL.gasPrice);
    expect(fuelPerMonth({ fuel: 'Diesel', mpgCity: 20, mpgHwy: 20 })).toBeGreaterThan(fuelPerMonth(gas(20, 20)));
    // 100 MPGe at 19¢/kWh is cheaper than 30 mpg at the pump
    expect(fuelPerMonth({ fuel: 'Electric', mpgCity: 100, mpgHwy: 100 })).toBeLessThan(fuelPerMonth(gas(30, 30)));
  });
  it('names what it burns', () => {
    expect(energyWords('Gasoline').word).toBe('gas');
    expect(energyWords('Diesel')).toEqual({ word: 'diesel', rate: `Wausau’s $${FUEL.dieselPrice.toFixed(2)}/gal` });
    expect(energyWords('Electric').rate).toMatch(/¢\/kWh$/);
  });
});

describe('allInMonthly', () => {
  it('is the payment plus the fuel', () => {
    const i = { monthlyIncome: 5000, paymentShare: 0.1, downPayment: 2000, tradeValue: 0, tradeOwed: 0, apr: 0.069, termMonths: 60 };
    const v = { price: 20000, ...gas(20, 28) };
    expect(allInMonthly(v, i)).toBeCloseTo(quote(20000, i).payment + fuelPerMonth(v), 6);
  });
});
