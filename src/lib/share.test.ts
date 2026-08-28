import { describe, expect, it } from 'vitest';
import type { LoanInputs } from './loan';
import { decodeInputs, encodeInputs } from './share';

const inputs: LoanInputs = {
  monthlyIncome: 4500,
  paymentShare: 0.1,
  downPayment: 1500,
  tradeValue: 0,
  tradeOwed: 0,
  apr: 0.069,
  termMonths: 60,
};

describe('share', () => {
  it('round-trips LoanInputs through the hash', () => {
    expect(decodeInputs(encodeInputs(inputs))).toEqual(inputs);
  });
  it('throws on a missing key', () => {
    expect(() => decodeInputs('income=4500&down=1500')).toThrow(/Missing/);
  });
  it('throws on a non-numeric value', () => {
    expect(() => decodeInputs(encodeInputs(inputs).replace('4500', 'lots'))).toThrow(/Bad/);
  });
  it('throws on a zero term', () => {
    expect(() => decodeInputs(encodeInputs({ ...inputs, termMonths: 0 }))).toThrow(/term/);
  });
});
