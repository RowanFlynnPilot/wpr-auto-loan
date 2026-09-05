import { describe, expect, it } from 'vitest';
import { BODIES, BodyIcon } from './BodyIcon';

describe('BodyIcon', () => {
  it('draws every canonical body type', () => {
    for (const body of BODIES) expect(() => BodyIcon({ body })).not.toThrow();
  });
  it('covers the bodies a dealer feed actually carries', () => {
    for (const body of ['Sedan', 'SUV', 'Truck', 'Hatchback', 'Wagon', 'Coupe', 'Convertible', 'Minivan', 'Van'])
      expect(BODIES).toContain(body);
  });
  it('throws on a body it cannot draw', () => {
    expect(() => BodyIcon({ body: 'Blimp' })).toThrow(/Blimp/);
  });
});
