import { describe, expect, it } from 'vitest';
import { FUEL } from '../config/wisconsin';
import { allInMonthly, combinedMpg, fuelPerMonth } from './fuel';
import { quote } from './loan';

describe('combinedMpg', () => {
  it('is the EPA 55/45 harmonic blend', () => {
    expect(combinedMpg(28, 39)).toBeCloseTo(1 / (0.55 / 28 + 0.45 / 39), 6);
  });
  it('lands between city and highway', () => {
    const c = combinedMpg(20, 30);
    expect(c).toBeGreaterThan(20);
    expect(c).toBeLessThan(30);
  });
  it('rejects a zero mpg', () => {
    expect(() => combinedMpg(0, 30)).toThrow();
  });
});

describe('fuelPerMonth', () => {
  it('is miles over combined mpg at the seeded price', () => {
    expect(fuelPerMonth(28, 39)).toBeCloseTo((FUEL.milesPerMonth / combinedMpg(28, 39)) * FUEL.gasPrice, 6);
  });
  it('thirstier vehicles cost more', () => {
    expect(fuelPerMonth(17, 23)).toBeGreaterThan(fuelPerMonth(28, 39));
  });
});

describe('allInMonthly', () => {
  it('is the payment plus the gas', () => {
    const i = { monthlyIncome: 5000, paymentShare: 0.1, downPayment: 2000, tradeValue: 0, tradeOwed: 0, apr: 0.069, termMonths: 60 };
    const v = { price: 20000, mpgCity: 20, mpgHwy: 28 };
    expect(allInMonthly(v, i)).toBeCloseTo(quote(20000, i).payment + fuelPerMonth(20, 28), 6);
  });
});
