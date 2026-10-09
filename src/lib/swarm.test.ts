import { describe, expect, it } from 'vitest';
import { swarmRows } from './swarm';

describe('swarmRows', () => {
  it('keeps dots that do not touch on the centre row', () => {
    expect(swarmRows([0, 100, 200], 9, 5)).toEqual([2, 2, 2]);
  });
  it('stacks touching dots outward from the centre, nearest rows first', () => {
    expect(swarmRows([0, 1, 2, 3, 4], 9, 5)).toEqual([2, 1, 3, 0, 4]);
  });
  it('answers in input order, whatever the x order', () => {
    expect(swarmRows([100, 0, 1], 9, 3)).toEqual([1, 1, 0]);
  });
  it('overlaps on the least crowded row once every row is taken', () => {
    expect(swarmRows([0, 0, 0, 0], 9, 3)).toEqual([1, 0, 2, 1]);
  });
  it('refuses a strip with no rows', () => {
    expect(() => swarmRows([1], 9, 0)).toThrow(/rows/);
  });
});
