import { describe, expect, it } from 'vitest';
import { capturedAgo, capturedDate, capturedOn } from './snapshot';

describe('snapshot dates', () => {
  it('reads the capture date as a local day, not UTC midnight', () => {
    const d = capturedDate('2026-09-12');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 8, 12]);
    expect(capturedOn('2026-09-12')).toBe('September 12, 2026');
  });
  it('refuses a date it cannot read', () => {
    expect(() => capturedDate('September 12, 2026')).toThrow(/Bad capture date/);
  });
  it('says the age in days under two weeks, then in weeks', () => {
    const now = new Date(2026, 9, 9); // Oct 9
    expect(capturedAgo('2026-10-09', now)).toBe('today');
    expect(capturedAgo('2026-10-08', now)).toBe('1 day ago');
    expect(capturedAgo('2026-09-30', now)).toBe('9 days ago');
    expect(capturedAgo('2026-09-12', now)).toBe('3 weeks ago');
  });
});
