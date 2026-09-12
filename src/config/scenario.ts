import type { LoanInputs } from '../lib/loan';

// The scenario the tool opens on, and the example the mini quotes payments at.
// Every payment the mini shows names these terms beside it.
export const DEFAULTS: LoanInputs = {
  monthlyIncome: 5000,
  paymentShare: 0.1,
  downPayment: 2000,
  tradeValue: 0,
  tradeOwed: 0,
  apr: 0.069,
  termMonths: 60,
};
