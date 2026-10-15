import { describe, expect, it } from 'vitest';
import type { LoanInputs } from './loan';
import { DEFAULT_VIEW, decodeInputs, decodeView, encodeInputs, encodeState, shareUrl } from './share';

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
  it('throws on a term the table does not offer', () => {
    expect(() => decodeInputs(encodeInputs({ ...inputs, termMonths: 0 }))).toThrow(/term/);
    expect(() => decodeInputs(encodeInputs({ ...inputs, termMonths: 66 }))).toThrow(/term/);
  });
  it('throws on a share or APR past 100%', () => {
    expect(() => decodeInputs(encodeInputs({ ...inputs, paymentShare: 3 }))).toThrow(/share/);
    expect(() => decodeInputs(encodeInputs({ ...inputs, apr: 5 }))).toThrow(/apr/);
  });
});

describe('view in the hash', () => {
  it('adds body and sort only when they are not the defaults', () => {
    expect(encodeState(inputs, DEFAULT_VIEW)).toBe(encodeInputs(inputs));
    const hash = encodeState(inputs, { body: 'SUV', sort: 'allin' });
    expect(hash).toContain('body=SUV');
    expect(hash).toContain('sort=allin');
    expect(decodeInputs(hash)).toEqual(inputs); // the scenario still decodes with the view beside it
    expect(decodeView(hash)).toEqual({ body: 'SUV', sort: 'allin' });
  });
  it('reads an older link, with no view, as the default view', () => {
    expect(decodeView(encodeInputs(inputs))).toEqual(DEFAULT_VIEW);
  });
  it('refuses a sort it does not have', () => {
    expect(() => decodeView('sort=cheapest')).toThrow(/sort/);
  });
});

describe('shareUrl', () => {
  const hash = '#income=4500&term=60';
  it('is the tool itself when standalone, with the encoded scenario rather than the address bar', () => {
    expect(shareUrl('', hash, 'https://tool.example/x#stale=1')).toBe('https://tool.example/x' + hash);
  });
  it('is the article plus the scenario inside the embed', () => {
    const host = encodeURIComponent('https://wausaupilotandreview.com/what-can-i-drive/#old');
    expect(shareUrl(`?host=${host}`, hash, 'ignored')).toBe('https://wausaupilotandreview.com/what-can-i-drive/' + hash);
  });
  it('refuses a host that is not the publisher over https', () => {
    for (const host of ['https://evil.example/', 'http://wausaupilotandreview.com/'])
      expect(() => shareUrl(`?host=${encodeURIComponent(host)}`, hash, 'x')).toThrow(/Refusing/);
  });
});
