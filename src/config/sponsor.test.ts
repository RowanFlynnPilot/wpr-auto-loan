import { describe, expect, it } from 'vitest';
import { resolvePitch } from './sponsor';

describe('resolvePitch', () => {
  it('is null with no parameter, so a reader never sees a preview', () => {
    expect(resolvePitch('')).toBeNull();
    expect(resolvePitch('?income=4500')).toBeNull();
  });
  it('names the prospect and carries their own links', () => {
    const pitch = resolvePitch('?pitch=brickners')!;
    expect(pitch.prospect).toBe("Brickner's of Wausau");
    expect(pitch.sponsor.preapprovalUrl).toContain('bricknersofwausau.net');
    expect(pitch.inventoryFile).toBe('inventory.brickners.json');
    expect(pitch.listingsAsOf).toMatch(/\d{4}/);
  });
  it('links each card to its own vehicle page when the listings carry one', () => {
    // inventoryUrl is the fallback for a prospect with no per-vehicle pages;
    // these listings have real ones, so it stays null.
    expect(resolvePitch('?pitch=brickners')!.sponsor.inventoryUrl).toBeNull();
  });
  it('falls back to the live sponsor on an unknown name', () => {
    expect(resolvePitch('?pitch=nobody')).toBeNull();
  });
});
