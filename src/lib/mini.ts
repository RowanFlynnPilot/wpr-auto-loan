import { SPONSOR } from '../config/sponsor';
import { isPublisher } from './share';

// Where a tap on the mini lands. The embed passes ?to=<the tool's page on the
// news site>; without it, the standalone tool. Only the publisher's own pages
// are accepted — the rule shared links already follow — so an embed on
// someone else's page cannot point WPR's card at their site; anything else
// is refused with a console error and readers go to the tool. A pitch
// preview carries its key through so the full tool opens in the same
// preview, and the link is tagged so mini-driven visits are reportable.
export function destination(search: string, origin: string, base: string): string {
  const params = new URLSearchParams(search);
  const to = params.get('to');
  let url = new URL(base, origin);
  if (to !== null) {
    const named = parse(to);
    if (named !== null && isPublisher(named)) url = named;
    else console.error(`Refusing mini destination ${to}; sending readers to the tool.`);
  }
  const pitch = params.get('pitch');
  if (pitch !== null) url.searchParams.set('pitch', pitch);
  url.searchParams.set('utm_source', SPONSOR.utmSource);
  url.searchParams.set('utm_medium', 'mini');
  url.searchParams.set('utm_campaign', SPONSOR.utmCampaign);
  return url.toString();
}

function parse(to: string): URL | null {
  try {
    return new URL(to);
  } catch {
    return null;
  }
}
