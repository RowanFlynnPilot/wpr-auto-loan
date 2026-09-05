import { TERMS, type LoanInputs } from './loan';

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
  // Bound what the UI can't represent: a term the table doesn't offer, or a
  // share/APR past 100% that would pin the slider while the math ran wild.
  if (!(TERMS as readonly number[]).includes(inputs.termMonths))
    throw new Error(`Bad "term" in shared link: ${inputs.termMonths} (want one of ${TERMS.join(', ')})`);
  if (inputs.paymentShare > 1) throw new Error(`Bad "share" in shared link: ${inputs.paymentShare}`);
  if (inputs.apr > 1) throw new Error(`Bad "apr" in shared link: ${inputs.apr}`);
  return inputs;
}

// Inside the WordPress embed the tool's own URL means nothing to a reader, so
// the embed snippet passes the article URL as ?host=… and a shared link is the
// article plus the scenario hash. Standalone, it's this page. Only the
// publisher's own domain is accepted as a host.
const PUBLISHER = /(^|\.)wausaupilotandreview\.com$/;

export function shareUrl(search: string, hash: string, href: string): string {
  const host = new URLSearchParams(search).get('host');
  if (host === null) return href;
  const url = new URL(host);
  if (url.protocol !== 'https:' || !PUBLISHER.test(url.hostname)) throw new Error(`Refusing share host ${host}`);
  url.hash = hash;
  return url.toString();
}
