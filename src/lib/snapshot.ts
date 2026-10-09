// A preview snapshot's capture date, in words, and how old it is. Shown
// wherever the preview lot appears: a stale snapshot presented as live is the
// failure mode of a pitch, so the age is said out loud rather than left to be
// worked out from a date.
const DAY_MS = 86_400_000;

// 'YYYY-MM-DD' as a local date; parsing it as ISO would place it at UTC
// midnight, which is the evening before in Wisconsin.
export function capturedDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) throw new Error(`Bad capture date ${iso}; want YYYY-MM-DD`);
  return new Date(y, m - 1, d);
}

const LONG = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

export function capturedOn(iso: string): string {
  return LONG.format(capturedDate(iso));
}

export function capturedAgo(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - capturedDate(iso).getTime()) / DAY_MS);
  if (days < 1) return 'today';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} weeks ago`;
}
