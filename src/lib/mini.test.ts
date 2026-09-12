import { describe, expect, it } from 'vitest';
import { destination } from './mini';

const origin = 'https://rowanflynnpilot.github.io';
const base = '/wpr-auto-loan/';

describe('destination', () => {
  it('is the standalone tool when the embed names nowhere', () => {
    const u = new URL(destination('', origin, base));
    expect(u.origin + u.pathname).toBe(origin + base);
    expect(u.searchParams.get('utm_medium')).toBe('mini');
  });
  it('is the article the embed names', () => {
    const to = 'https://wausaupilotandreview.com/what-can-i-drive/';
    const u = new URL(destination(`?to=${encodeURIComponent(to)}`, origin, base));
    expect(u.origin + u.pathname).toBe(to);
    expect(u.searchParams.get('utm_source')).toBe('wausaupilot');
  });
  it('refuses a destination that is not http(s)', () => {
    const u = new URL(destination('?to=javascript:alert(1)', origin, base));
    expect(u.origin + u.pathname).toBe(origin + base);
  });
  it('carries a pitch preview through to the full tool', () => {
    const u = new URL(destination('?pitch=brickners', origin, base));
    expect(u.searchParams.get('pitch')).toBe('brickners');
  });
});
