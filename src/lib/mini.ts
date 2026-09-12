import { SPONSOR } from '../config/sponsor';

// Where a tap on the mini lands. The embed passes ?to=<the tool's page on the
// news site>; without it, the standalone tool. http(s) only — never a script
// URL. A pitch preview carries its key through so the full tool opens in the
// same preview, and the link is tagged so mini-driven visits are reportable.
export function destination(search: string, origin: string, base: string): string {
  const params = new URLSearchParams(search);
  const to = params.get('to');
  const url = new URL(to !== null && /^https?:\/\//i.test(to) ? to : base, origin);
  const pitch = params.get('pitch');
  if (pitch !== null) url.searchParams.set('pitch', pitch);
  url.searchParams.set('utm_source', SPONSOR.utmSource);
  url.searchParams.set('utm_medium', 'mini');
  url.searchParams.set('utm_campaign', SPONSOR.utmCampaign);
  return url.toString();
}
