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
