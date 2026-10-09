import { useState } from 'react';
import { PITCH, SPONSOR } from '../config/sponsor';
import { dollars } from '../lib/format';
import { allInMonthly, combinedMpg } from '../lib/fuel';
import { downToReach, type LoanInputs } from '../lib/loan';
import { capturedAgo, capturedOn } from '../lib/snapshot';
import type { Inventory, Vehicle } from '../types';
import { SponsorLockup } from './SponsorLockup';
import { VehicleCard } from './VehicleCard';

interface Props {
  inventory: Inventory;
  inputs: LoanInputs;
  ceiling: number;
}

// Every ordering is feed data, or our math on it; ties fall back to price so
// the list is stable. Payment order is price order, so it is named for what
// the reader is looking at.
const SORTS: Record<string, { label: string; by: (a: Vehicle, b: Vehicle, i: LoanInputs) => number }> = {
  price: { label: 'Lowest payment', by: (a, b) => a.price - b.price },
  allin: { label: 'Lowest with gas', by: (a, b, i) => allInMonthly(a, i) - allInMonthly(b, i) || a.price - b.price },
  mileage: { label: 'Fewest miles', by: (a, b) => a.mileage - b.mileage || a.price - b.price },
  mpg: {
    label: 'Best mpg',
    by: (a, b) => combinedMpg(b.mpgCity, b.mpgHwy) - combinedMpg(a.mpgCity, a.mpgHwy) || a.price - b.price,
  },
  year: { label: 'Newest', by: (a, b) => b.year - a.year || a.price - b.price },
};

// A real lot is a couple of hundred vehicles; 24 at a time keeps the page
// (and the embed) a readable length, and the button says what is left.
const PAGE = 24;

export function InventoryGrid({ inventory, inputs, ceiling }: Props) {
  const [body, setBody] = useState<string>('All');
  const [sort, setSort] = useState<string>('price');
  const [visible, setVisible] = useState(PAGE);

  const fits = inventory.vehicles.filter((v) => v.price <= ceiling).sort((a, b) => SORTS[sort].by(a, b, inputs));
  const over = inventory.vehicles.length - fits.length;
  const bodies = ['All', ...Array.from(new Set(fits.map((v) => v.body))).sort()];
  // A chosen body type can drop out when the ceiling falls; treat it as All
  // rather than showing an empty grid under chips that say vehicles fit.
  const active = bodies.includes(body) ? body : 'All';
  const shown = active === 'All' ? fits : fits.filter((v) => v.body === active);
  const cheapest = inventory.vehicles.reduce((a, b) => (b.price < a.price ? b : a));
  // A button for the last handful is sillier than the handful; show them.
  const cut = shown.length - visible < 8 ? shown.length : visible;

  return (
    <section className="inventory">
      <header>
        <h2>In the lot under {dollars(ceiling)}</h2>
        <p className="sponsor">{SPONSOR.disclosure}</p>
      </header>
      <SponsorLockup />

      {fits.length === 0 ? (
        <p className="empty">
          Nothing at {SPONSOR.name} fits under {dollars(ceiling)}. The closest is the {cheapest.year}{' '}
          {cheapest.make} {cheapest.model} at {dollars(cheapest.price)} — about{' '}
          {dollars(downToReach(cheapest.price, inputs))} more down would get you there, or a larger share of
          income.
        </p>
      ) : (
        <>
          <div className="chips">
            {bodies.map((b) => (
              <button
                key={b}
                aria-pressed={b === active}
                className={b === active ? 'chip on' : 'chip'}
                onClick={() => {
                  setBody(b);
                  setVisible(PAGE);
                }}
              >
                {b}
                <span>{b === 'All' ? fits.length : fits.filter((v) => v.body === b).length}</span>
              </button>
            ))}
            <label className="sort">
              Sort
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setVisible(PAGE);
                }}
              >
                {Object.entries(SORTS).map(([key, o]) => (
                  <option key={key} value={key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid">
            {shown.slice(0, cut).map((v) => (
              <VehicleCard key={v.stock} vehicle={v} inputs={inputs} />
            ))}
          </div>
          {shown.length > cut && (
            <button type="button" className="more" onClick={() => setVisible((n) => n + PAGE)}>
              Show {Math.min(PAGE, shown.length - cut)} more
              <small>{cut} of {shown.length} shown</small>
            </button>
          )}
        </>
      )}

      {/* generatedAt is when the nightly build ran. For a preview that is not
          when the lot was true; the snapshot's capture date is. */}
      <p className="note">
        {over > 0 && `${over} more ${over === 1 ? 'vehicle is' : 'vehicles are'} above your ceiling. `}
        {PITCH
          ? `Listings captured ${capturedOn(PITCH.capturedOn)} (${capturedAgo(PITCH.capturedOn)}): ${inventory.vehicles.length} of the ${PITCH.listed} they listed; the rest publish no price or no fuel economy.`
          : `Inventory updated ${new Date(inventory.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`}
      </p>
    </section>
  );
}
