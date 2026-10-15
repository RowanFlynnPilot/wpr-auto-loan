import { describe, expect, it } from 'vitest';
import { PAGE, pageCut } from './InventoryGrid';

describe('pageCut', () => {
  it('shows a page at a time', () => {
    expect(pageCut(70, PAGE)).toBe(PAGE);
    expect(pageCut(70, 2 * PAGE)).toBe(2 * PAGE);
  });
  it('shows a last handful outright rather than behind a button', () => {
    expect(pageCut(25, PAGE)).toBe(25);
    expect(pageCut(31, PAGE)).toBe(31);
    expect(pageCut(32, PAGE)).toBe(PAGE);
  });
  it('never cuts past what there is', () => {
    expect(pageCut(10, 3 * PAGE)).toBe(10);
  });
});
