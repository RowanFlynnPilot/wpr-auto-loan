// Rows for a one-dimensional strip of dots — a beeswarm. Each dot takes the
// row nearest the centre where it won't touch the last dot placed there, so
// dense stretches stack outward and sparse ones stay on one line, and the
// strip shows density honestly instead of printing the lot's price order as
// diagonal stripes. Returns a row index (0..rows-1) per input, in input order.
export function swarmRows(xs: number[], gap: number, rows: number): number[] {
  if (rows < 1) throw new Error(`rows must be positive, got ${rows}`);
  const mid = Math.floor(rows / 2);
  // mid, then mid-1, mid+1, mid-2, mid+2, …
  const preference = Array.from({ length: rows }, (_, i) => mid + (i % 2 === 1 ? -1 : 1) * Math.ceil(i / 2));
  const last = new Array<number>(rows).fill(-Infinity);
  const row = new Array<number>(xs.length).fill(mid);
  const byX = xs.map((_, k) => k).sort((a, b) => xs[a] - xs[b]);
  for (const k of byX) {
    const free = preference.find((p) => xs[k] - last[p] >= gap);
    // Every row taken: the least crowded one, and the dots overlap a little.
    const p = free ?? preference.reduce((a, b) => (last[a] <= last[b] ? a : b));
    last[p] = xs[k];
    row[k] = p;
  }
  return row;
}
