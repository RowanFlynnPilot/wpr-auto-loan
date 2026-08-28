import type { LoanInputs } from './loan';

// URL-hash serialization so a reader can share "here's what I can drive"
// and a prepared scenario can be deep-linked. Keys are short but readable;
// values are plain decimals (share and apr as fractions, same as LoanInputs).
const KEYS: Record<string, keyof LoanInputs> = {
  income: 'monthlyIncome',
  share: 'paymentShare',
  down: 'downPayment',
  trade: 'tradeValue',
  owed: 'tradeOwed',
  apr: 'apr',
  term: 'termMonths',
};

export function encodeInputs(i: LoanInputs): string {
  const params = new URLSearchParams();
  for (const [key, field] of Object.entries(KEYS)) params.set(key, String(i[field]));
  return params.toString();
}

export function decodeInputs(hash: string): LoanInputs {
  const params = new URLSearchParams(hash);
  const inputs = {} as LoanInputs;
  for (const [key, field] of Object.entries(KEYS)) {
    const raw = params.get(key);
    if (raw === null) throw new Error(`Missing "${key}" in shared link`);
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) throw new Error(`Bad "${key}" in shared link: ${raw}`);
    inputs[field] = value;
  }
  if (inputs.termMonths <= 0) throw new Error(`Bad "term" in shared link: ${inputs.termMonths}`);
  return inputs;
}
