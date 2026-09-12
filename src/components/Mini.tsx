import { useEffect, useMemo, useState } from 'react';
import { DEFAULTS } from '../config/scenario';
import { PITCH, SPONSOR } from '../config/sponsor';
import { dollars, percent } from '../lib/format';
import { quote } from '../lib/loan';
import { destination } from '../lib/mini';
import { trackMiniClick, trackVehicleClick, vdpLink } from '../lib/track';
import type { Inventory, Vehicle } from '../types';
import { BodyIcon } from './BodyIcon';

const DWELL_MS = 6000;

// Newest model years first; the reader sees the lot's best foot.
function order(vehicles: Vehicle[]): Vehicle[] {
  return [...vehicles].sort((a, b) => b.year - a.year || a.price - b.price);
}

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// A sidebar-sized slideshow of the sponsor's lot. Every payment it quotes is
// an example at the tool's default terms, named beside the figure; the whole
// point of the card is the link into the full tool, where the reader's own
// numbers take over.
export function Mini() {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [held, setHeld] = useState(false); // hover or focus pauses the clock

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}${PITCH?.inventoryFile ?? 'inventory.json'}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Inventory>;
      })
      .then(setInventory)
      .catch((e: Error) => {
        console.error(e);
        setLoadError(true);
      });
  }, []);

  const lot = useMemo(() => (inventory ? order(inventory.vehicles) : []), [inventory]);
  const n = lot.length;

  useEffect(() => {
    if (!playing || held || n < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), DWELL_MS);
    return () => clearInterval(t);
  }, [playing, held, n]);

  const tool = destination(window.location.search, window.location.origin, import.meta.env.BASE_URL);

  if (loadError) {
    return (
      <section className="mini">
        <p className="error">The lot didn&rsquo;t load. The full tool still works.</p>
        <a className="mini-cta" href={tool} target="_top" onClick={() => trackMiniClick('tool')}>
          What can you actually afford? <span aria-hidden="true">→</span>
        </a>
      </section>
    );
  }
  if (n === 0) return <section className="mini"><p className="loading">Loading the lot…</p></section>;

  const v = lot[index];
  const q = quote(v.price, DEFAULTS);
  const step = (d: number) => setIndex((i) => (i + d + n) % n);

  return (
    <section
      className="mini"
      aria-roledescription="carousel"
      aria-label={`${SPONSOR.name} inventory`}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      {PITCH && (
        <p className="mini-pitch">
          Preview for {PITCH.prospect} · listings as of {PITCH.listingsAsOf}
        </p>
      )}

      {/* Announce slides only when the clock is stopped; a rotating live region is noise. */}
      <div className="mini-slide" aria-live={playing && !held ? 'off' : 'polite'} aria-atomic="true">
        {v.photoUrl ? (
          <img src={v.photoUrl} alt={`${v.year} ${v.make} ${v.model}`} width={640} height={480} />
        ) : (
          <div className="photo-blank" aria-hidden="true">
            <BodyIcon body={v.body} />
          </div>
        )}
        <div className="mini-body">
          <h2>
            {v.year} {v.make} {v.model} <small>{v.trim}</small>
          </h2>
          <p className="mini-money">
            <span className="mini-pay">
              {dollars(q.payment)}<small>/mo</small>
            </span>
            <span className="mini-price">{dollars(v.price)}</span>
          </p>
          {/* Reg Z: a payment is shown with the terms that produce it. */}
          <p className="mini-terms">
            Example at {dollars(DEFAULTS.downPayment)} down, {DEFAULTS.termMonths} months, {percent(DEFAULTS.apr)} APR,
            Wisconsin tax and fees included. Your own numbers in the full tool.
          </p>
        </div>
      </div>

      <div className="mini-controls">
        <button type="button" onClick={() => step(-1)} aria-label="Previous vehicle"><Chevron flip /></button>
        <span className="mini-count">{index + 1} of {n}</span>
        <button type="button" onClick={() => step(1)} aria-label="Next vehicle"><Chevron /></button>
        <button type="button" className="mini-play" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>

      <footer className="mini-foot">
        <a className="mini-cta" href={tool} target="_top" onClick={() => trackMiniClick('tool')}>
          What can you actually afford? <span aria-hidden="true">→</span>
        </a>
        <a
          className="mini-vdp"
          href={vdpLink(v)}
          target="_top"
          rel="noopener noreferrer sponsored"
          onClick={() => trackVehicleClick(v, 'mini')}
        >
          This one at {SPONSOR.name} <span aria-hidden="true">→</span>
        </a>
        <p className="mini-sponsor">{SPONSOR.disclosure} · Wausau Pilot &amp; Review</p>
      </footer>
    </section>
  );
}
