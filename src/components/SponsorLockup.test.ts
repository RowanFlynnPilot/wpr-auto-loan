import { describe, expect, it } from 'vitest';
import { splitTagline } from './SponsorLockup';

describe('splitTagline', () => {
  it('splits what they offer from where they are', () => {
    expect(splitTagline('Used cars, trucks and SUVs — Wausau, WI')).toEqual([
      'Used cars, trucks and SUVs',
      'Wausau, WI',
    ]);
  });
  it('keeps a tagline with no em-dash whole', () => {
    expect(splitTagline('Serving Marathon County since 1974')).toEqual([
      'Serving Marathon County since 1974',
      null,
    ]);
  });
  it('drops an empty second half', () => {
    expect(splitTagline('Used cars —')).toEqual(['Used cars', null]);
  });
});
