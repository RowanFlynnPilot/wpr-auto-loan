import { describe, expect, it } from 'vitest';
import type { Vehicle } from '../types';
import { preapprovalLink, vdpLink } from './track';

const v: Vehicle = {
  stock: 'T100',
  vin: '1HGCM82633A004352',
  year: 2022,
  make: 'Honda',
  model: 'Civic',
  trim: 'Sport',
  body: 'Sedan',
  price: 21500,
  mileage: 18000,
  mpgCity: 30,
  mpgHwy: 37,
  drivetrain: 'FWD',
  exteriorColor: 'Blue',
  features: [],
  photoUrl: '',
  vdpUrl: 'https://dealer.example/inventory/T100?color=blue',
};

// The sponsor report is built on these tags; a change here is a change to
// what the dealer sees in their own analytics.
describe('outbound links carry the report tags', () => {
  it('tags a vehicle page with the fleet source, the tool medium and the stock', () => {
    const u = new URL(vdpLink(v));
    expect(u.origin + u.pathname).toBe('https://dealer.example/inventory/T100');
    expect(u.searchParams.get('color')).toBe('blue'); // the dealer's own query survives
    expect(u.searchParams.get('utm_source')).toBe('wausaupilotandreview');
    expect(u.searchParams.get('utm_medium')).toBe('tool');
    expect(u.searchParams.get('utm_campaign')).toBe('what-can-i-drive');
    expect(u.searchParams.get('utm_content')).toBe('T100');
  });
  it('tags the pre-approval link with its own content key', () => {
    const u = new URL(preapprovalLink());
    expect(u.searchParams.get('utm_source')).toBe('wausaupilotandreview');
    expect(u.searchParams.get('utm_medium')).toBe('tool');
    expect(u.searchParams.get('utm_content')).toBe('preapproval');
  });
});
