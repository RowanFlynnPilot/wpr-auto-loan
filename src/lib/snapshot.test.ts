import { describe, expect, it } from 'vitest';
import { capturedAgo, capturedDate, capturedLine, capturedOn } from './snapshot';

describe('snapshot dates', () => {
  it('reads the capture date as a local day, not UTC midnight', () => {
    const d = capturedDate('2026-09-12');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 8, 12]);
    expect(capturedOn('2026-09-12')).toBe('September 12, 2026');
  });
  it('refuses a date it cannot read, and one that does not exist', () => {
    expect(() => capturedDate('September 12, 2026')).toThrow(/Bad capture date/);
    expect(() => capturedDate('2026-10-32')).toThrow(/Bad capture date/);
    expect(() => capturedDate('2026-13-01')).toThrow(/Bad capture date/);
    expect(() => capturedDate('2026-02-29')).toThrow(/Bad capture date/);
  });
  it('says the age in days under two weeks, weeks under two months, then months', () => {
    const now = new Date(2026, 9, 9); // Oct 9
    expect(capturedAgo('2026-10-09', now)).toBe('today');
    expect(capturedAgo('2026-10-08', now)).toBe('1 day ago');
    expect(capturedAgo('2026-09-30', now)).toBe('9 days ago');
    expect(capturedAgo('2026-09-12', now)).toBe('3 weeks ago');
    expect(capturedAgo('2026-08-12', now)).toBe('8 weeks ago');
    expect(capturedAgo('2026-07-01', now)).toBe('3 months ago');
  });
  it('counts calendar days, so a clock change does not cost a day', () => {
    // US clocks sprang forward on March 8, 2026; half past midnight on the
    // 15th is 13 days 23.5 hours of wall time after midnight on the 1st.
    expect(capturedAgo('2026-03-01', new Date(2026, 2, 14, 0, 30))).toBe('13 days ago');
    expect(capturedAgo('2026-03-01', new Date(2026, 2, 15, 0, 30))).toBe('2 weeks ago');
  });
  it('has one phrase for every surface', () => {
    expect(capturedLine('2026-10-09', new Date(2026, 9, 14))).toBe('October 9, 2026 (5 days ago)');
  });
});
