import { useEffect, useMemo, useState } from 'react';
import { DEFAULTS } from '../config/scenario';
import { PITCH, SPONSOR } from '../config/sponsor';
import { dollars, percent } from '../lib/format';
import { quote } from '../lib/loan';
import { destination } from '../lib/mini';
import { capturedAgo, capturedOn } from '../lib/snapshot';
import { trackMiniClick, trackVehicleClick, vdpLink } from '../lib/track';
import type { Inventory, Vehicle } from '../types';
import { Photo } from './Photo';

const DWELL_MS = 6000;

// Newest model years first; the reader sees the lot's best foot.
export function order(vehicles: Vehicle[]): Vehicle[] {
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
// numbers take over. Both links are verb-first, as house CTAs are.
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

  // The next photo is fetched while this one shows, so advancing never
  // paints a blank first.
  useEffect(() => {
    if (n < 2) return;
    const next = lot[(index + 1) % n];
    if (next.photoUrl === '') return;
    const img = new Image();
    img.src = next.photoUrl;
  }, [index, lot, n]);

  // Resolved once: a refused ?to= logs its error, and it should log once, not
  // on every slide.
  const tool = useMemo(() => destination(window.location.search, window.location.origin, import.meta.env.BASE_URL), []);

  if (loadError) {
    return (
      <section className="mini">
        <p className="error">The lot didn&rsquo;t load. The full tool still works.</p>
        <a className="mini-cta" href={tool} target="_top" onClick={() => trackMiniClick('tool')}>
          See what you can afford <span aria-hidden="true">→</span>
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
          Preview for {PITCH.prospect} · listings as of {capturedOn(PITCH.capturedOn)} ({capturedAgo(PITCH.capturedOn)})
        </p>
      )}

      {/* W3C carousel pattern: the slide is a named group, announced only
          when the clock is stopped, since a rotating live region is noise. */}
      <div className="mini-slides" aria-live={playing && !held ? 'off' : 'polite'} aria-atomic="true">
        <div className="mini-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${n}`}>
        <Photo key={v.stock} vehicle={v} width={640} height={480} />
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
      </div>

      <div className="mini-controls">
        {/* The rotation control comes first in reading order and its label
            carries the state, so it needs no pressed attribute. */}
        <button type="button" className="mini-play" onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={() => step(-1)} aria-label="Previous vehicle"><Chevron flip /></button>
        <span className="mini-count">{index + 1} of {n}</span>
        <button type="button" onClick={() => step(1)} aria-label="Next vehicle"><Chevron /></button>
      </div>

      <footer className="mini-foot">
        <a className="mini-cta" href={tool} target="_top" onClick={() => trackMiniClick('tool')}>
          See what you can afford <span aria-hidden="true">→</span>
        </a>
        <a
          className="mini-vdp"
          href={vdpLink(v)}
          target="_top"
          rel="noopener noreferrer sponsored"
          onClick={() => trackVehicleClick(v, 'mini')}
        >
          See this one at {SPONSOR.name} <span aria-hidden="true">→</span>
        </a>
        <p className="mini-sponsor">{SPONSOR.disclosure} · Wausau Pilot &amp; Review</p>
      </footer>
    </section>
  );
}
