import { WISCONSIN } from '../config/wisconsin';

export const TERMS = [48, 60, 72, 84] as const;

export interface LoanInputs {
  monthlyIncome: number; // gross, dollars
  paymentShare: number;  // fraction of income for the car payment
  downPayment: number;
  tradeValue: number;    // what the trade is worth
  tradeOwed: number;     // remaining balance on the trade
  apr: number;           // fraction, e.g. 0.069
  termMonths: number;
}

export interface Quote {
  price: number;
  salesTax: number;
  fees: number;
  financed: number;
  payment: number;
  totalInterest: number;
  termMonths: number;
}

export function salesTaxRate(): number {
  return WISCONSIN.stateSalesTax + WISCONSIN.countySalesTax;
}

export function purchaseFees(): number {
  const w = WISCONSIN;
  return w.titleFee + w.lienFee + w.registrationFee + w.plateFee + w.countyWheelTax;
}

// Wisconsin credits the full trade-in value against the taxable price.
export function salesTax(price: number, tradeValue: number): number {
  return Math.max(price - tradeValue, 0) * salesTaxRate();
}

export function amountFinanced(price: number, i: LoanInputs): number {
  const financed =
    price + salesTax(price, i.tradeValue) + purchaseFees() - i.downPayment - i.tradeValue + i.tradeOwed;
  return Math.max(financed, 0);
}

export function monthlyPayment(principal: number, apr: number, months: number): number {
  if (months <= 0) throw new Error(`termMonths must be positive, got ${months}`);
  if (principal < 0) throw new Error(`principal must be non-negative, got ${principal}`);
  if (principal === 0) return 0;
  if (apr === 0) return principal / months;
  const r = apr / 12;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function principalForPayment(payment: number, apr: number, months: number): number {
  if (months <= 0) throw new Error(`termMonths must be positive, got ${months}`);
  if (apr === 0) return payment * months;
  const r = apr / 12;
  return (payment * (1 - Math.pow(1 + r, -months))) / r;
}

export function maxPayment(i: LoanInputs): number {
  return i.monthlyIncome * i.paymentShare;
}

// Highest sticker price whose financed amount lands on maxPayment.
export function maxPrice(i: LoanInputs): number {
  const P = principalForPayment(maxPayment(i), i.apr, i.termMonths);
  const t = salesTaxRate();
  const equityAndCash = i.downPayment + i.tradeValue - i.tradeOwed - purchaseFees();
  // Assume price >= tradeValue so tax applies to (price - tradeValue).
  const taxed = (P + equityAndCash + t * i.tradeValue) / (1 + t);
  const price = taxed >= i.tradeValue ? taxed : P + equityAndCash;
  return Math.max(price, 0);
}

export function quote(price: number, i: LoanInputs, termMonths: number = i.termMonths): Quote {
  const financed = amountFinanced(price, i);
  const payment = monthlyPayment(financed, i.apr, termMonths);
  return {
    price,
    salesTax: salesTax(price, i.tradeValue),
    fees: purchaseFees(),
    financed,
    payment,
    totalInterest: payment * termMonths - financed,
    termMonths,
  };
}

export function termComparison(price: number, i: LoanInputs): Quote[] {
  return TERMS.map((t) => quote(price, i, t));
}

// Extra cash down that would lift the ceiling to `price` — 0 if it already
// reaches. Inverse of maxPrice in the down-payment direction.
export function downToReach(price: number, i: LoanInputs): number {
  const P = principalForPayment(maxPayment(i), i.apr, i.termMonths);
  const t = salesTaxRate();
  const equityAndCash = i.downPayment + i.tradeValue - i.tradeOwed - purchaseFees();
  const taxable = price >= i.tradeValue;
  const need = taxable ? price * (1 + t) - t * i.tradeValue - P - equityAndCash : price - P - equityAndCash;
  return Math.max(need, 0);
}

// Paying `extra` on top of the required payment: how many months come off the
// loan and how much interest never accrues. Null when nothing is financed.
export function extraPayment(
  price: number,
  i: LoanInputs,
  extra: number,
): { monthsSaved: number; interestSaved: number } | null {
  if (extra <= 0) throw new Error(`extra must be positive, got ${extra}`);
  const financed = amountFinanced(price, i);
  if (financed === 0) return null;
  const required = monthlyPayment(financed, i.apr, i.termMonths);
  const paid = required + extra;
  const r = i.apr / 12;
  const months = r === 0 ? financed / paid : -Math.log(1 - (financed * r) / paid) / Math.log(1 + r);
  return {
    monthsSaved: i.termMonths - months,
    interestSaved: required * i.termMonths - paid * months,
  };
}

// How much each realistic move raises the ceiling. aprPoint is null when the
// APR is already under a point; nextTerm when the longest term is chosen.
export function ceilingLevers(i: LoanInputs): {
  down500: number;
  aprPoint: number | null;
  nextTerm: { termMonths: number; delta: number } | null;
} {
  const base = maxPrice(i);
  const next = TERMS.find((t) => t > i.termMonths);
  return {
    down500: maxPrice({ ...i, downPayment: i.downPayment + 500 }) - base,
    aprPoint: i.apr >= 0.01 ? maxPrice({ ...i, apr: i.apr - 0.01 }) - base : null,
    nextTerm: next === undefined ? null : { termMonths: next, delta: maxPrice({ ...i, termMonths: next }) - base },
  };
}
