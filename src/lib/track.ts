import { SPONSOR } from '../config/sponsor';
import type { Vehicle } from '../types';

declare global {
  interface Window {
    plausible: (event: string, opts?: { props: Record<string, string | number> }) => void;
  }
}

export function vdpLink(v: Vehicle): string {
  // A pitch preview has no per-vehicle URLs on the prospect's site, so every
  // card points at their own used-inventory search instead of a fake VDP.
  const url = new URL(SPONSOR.inventoryUrl ?? v.vdpUrl);
  url.searchParams.set('utm_source', SPONSOR.utmSource);
  url.searchParams.set('utm_medium', 'tool');
  url.searchParams.set('utm_campaign', SPONSOR.utmCampaign);
  url.searchParams.set('utm_content', v.stock);
  return url.toString();
}

export function trackVehicleClick(v: Vehicle, placement: 'tool' | 'mini' = 'tool'): void {
  window.plausible('Vehicle click', {
    props: { sponsor: SPONSOR.name, stock: v.stock, body: v.body, price: v.price, placement },
  });
}

// The mini's job is sending readers into the full tool; this is how it's scored.
export function trackMiniClick(target: 'tool'): void {
  window.plausible('Mini Click', { props: { sponsor: SPONSOR.name, target } });
}

export function preapprovalLink(): string {
  const url = new URL(SPONSOR.preapprovalUrl);
  url.searchParams.set('utm_source', SPONSOR.utmSource);
  url.searchParams.set('utm_medium', 'tool');
  url.searchParams.set('utm_campaign', SPONSOR.utmCampaign);
  url.searchParams.set('utm_content', 'preapproval');
  return url.toString();
}

export function trackPreapprovalClick(): void {
  window.plausible('Preapproval click', { props: { sponsor: SPONSOR.name } });
}
