// A preview snapshot's capture date, in words, and how old it is. Shown
// wherever the preview lot appears: a stale snapshot presented as live is the
// failure mode of a pitch, so the age is said out loud rather than left to be
// worked out from a date.
const DAY_MS = 86_400_000;

// 'YYYY-MM-DD' as a local calendar day; parsing it as ISO would place it at
// UTC midnight, the evening before in Wisconsin. A date that doesn't exist
// ('2026-10-32' would roll into November) is refused rather than rendered.
export function capturedDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (!y || !m || !d || date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    throw new Error(`Bad capture date ${iso}; want a real YYYY-MM-DD`);
  }
  return date;
}

const LONG = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export function capturedOn(iso: string): string {
  return LONG.format(capturedDate(iso));
}

// Whole calendar days from the capture to now, counted on UTC dates so a
// daylight-saving change cannot lose an hour and a day with it.
function daysSince(date: Date, now: Date): number {
  const from = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const to = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((to - from) / DAY_MS);
}

export function capturedAgo(iso: string, now: Date = new Date()): string {
  const days = daysSince(capturedDate(iso), now);
  if (days < 1) return 'today';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// The one phrase every surface uses: "October 9, 2026 (5 days ago)".
export function capturedLine(iso: string, now: Date = new Date()): string {
  return `${capturedOn(iso)} (${capturedAgo(iso, now)})`;
}
