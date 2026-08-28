import { describe, expect, it } from 'vitest';
import { amountFinanced, ceilingLevers, maxPayment, maxPrice, monthlyPayment, quote, termComparison } from './loan';

const base = {
  monthlyIncome: 5000,
  paymentShare: 0.1,
  downPayment: 2000,
  tradeValue: 0,
  tradeOwed: 0,
  apr: 0.069,
  termMonths: 60,
};

describe('monthlyPayment', () => {
  it('matches the standard amortization formula', () => {
    expect(monthlyPayment(20000, 0.06, 60)).toBeCloseTo(386.66, 2);
  });
  it('handles zero APR', () => {
    expect(monthlyPayment(12000, 0, 48)).toBe(250);
  });
  it('rejects a zero term', () => {
    expect(() => monthlyPayment(1, 0.05, 0)).toThrow();
  });
});

describe('maxPrice', () => {
  it('round-trips through amountFinanced to the max payment', () => {
    const price = maxPrice(base);
    const payment = monthlyPayment(amountFinanced(price, base), base.apr, base.termMonths);
    expect(payment).toBeCloseTo(maxPayment(base), 6);
  });
  it('round-trips with a trade-in and negative equity', () => {
    const i = { ...base, tradeValue: 8000, tradeOwed: 10500 };
    const price = maxPrice(i);
    const payment = monthlyPayment(amountFinanced(price, i), i.apr, i.termMonths);
    expect(payment).toBeCloseTo(maxPayment(i), 6);
  });
  it('never goes negative', () => {
    expect(maxPrice({ ...base, monthlyIncome: 0, downPayment: 0 })).toBe(0);
  });
});

describe('termComparison', () => {
  it('longer terms cost more interest', () => {
    const rows = termComparison(25000, base);
    for (let k = 1; k < rows.length; k++) {
      expect(rows[k].totalInterest).toBeGreaterThan(rows[k - 1].totalInterest);
      expect(rows[k].payment).toBeLessThan(rows[k - 1].payment);
    }
  });
});

describe('ceilingLevers', () => {
  it('cash down passes through net of sales tax', () => {
    // Price ceiling scales the extra $500 by 1/(1 + tax rate).
    expect(ceilingLevers(base).down500).toBeCloseTo(500 / 1.055, 2);
  });
  it('a lower APR and a longer term both raise the ceiling', () => {
    const l = ceilingLevers(base);
    expect(l.aprPoint).toBeGreaterThan(0);
    expect(l.nextTerm).toEqual({ termMonths: 72, delta: expect.any(Number) });
    expect(l.nextTerm!.delta).toBeGreaterThan(0);
  });
  it('drops unavailable levers', () => {
    const l = ceilingLevers({ ...base, apr: 0.005, termMonths: 84 });
    expect(l.aprPoint).toBeNull();
    expect(l.nextTerm).toBeNull();
  });
});

describe('quote', () => {
  it('applies the trade-in credit to sales tax', () => {
    const q = quote(30000, { ...base, tradeValue: 10000 });
    expect(q.salesTax).toBeCloseTo(20000 * 0.055, 6);
  });
});
