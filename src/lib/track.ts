import { SPONSOR } from '../config/sponsor';
import type { Vehicle } from '../types';

declare global {
  interface Window {
    plausible: (event: string, opts?: { props: Record<string, string | number> }) => void;
  }
}

export function vdpLink(v: Vehicle): string {
  const url = new URL(v.vdpUrl);
  url.searchParams.set('utm_source', SPONSOR.utmSource);
  url.searchParams.set('utm_medium', 'tool');
  url.searchParams.set('utm_campaign', SPONSOR.utmCampaign);
  url.searchParams.set('utm_content', v.stock);
  return url.toString();
}

export function trackVehicleClick(v: Vehicle): void {
  window.plausible('Vehicle click', {
    props: { sponsor: SPONSOR.name, stock: v.stock, body: v.body, price: v.price },
  });
}
