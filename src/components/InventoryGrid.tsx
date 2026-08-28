import { useState } from 'react';
import { SPONSOR } from '../config/sponsor';
import { dollars } from '../lib/format';
import type { LoanInputs } from '../lib/loan';
import { preapprovalLink, trackPreapprovalClick } from '../lib/track';
import type { Inventory } from '../types';
import { VehicleCard } from './VehicleCard';

interface Props {
  inventory: Inventory;
  inputs: LoanInputs;
  ceiling: number;
}

export function InventoryGrid({ inventory, inputs, ceiling }: Props) {
  const [body, setBody] = useState<string>('All');

  const fits = inventory.vehicles.filter((v) => v.price <= ceiling).sort((a, b) => a.price - b.price);
  const over = inventory.vehicles.length - fits.length;
  const bodies = ['All', ...Array.from(new Set(fits.map((v) => v.body))).sort()];
  // A chosen body type can drop out when the ceiling falls; treat it as All
  // rather than showing an empty grid under chips that say vehicles fit.
  const active = bodies.includes(body) ? body : 'All';
  const shown = active === 'All' ? fits : fits.filter((v) => v.body === active);

  return (
    <section className="inventory">
      <header>
        <h2>In the lot under {dollars(ceiling)}</h2>
        <p className="sponsor">
          {SPONSOR.disclosure} · {SPONSOR.name}
        </p>
      </header>
      <a
        className="preapproval"
        href={preapprovalLink()}
        target="_blank"
        rel="noopener sponsored"
        onClick={trackPreapprovalClick}
      >
        Get pre-approved at {SPONSOR.name} <span aria-hidden="true">→</span>
      </a>

      {fits.length === 0 ? (
        <p className="empty">
          Nothing at {SPONSOR.name} fits under {dollars(ceiling)}. A bigger down payment or a larger share of
          income raises the ceiling.
        </p>
      ) : (
        <>
          <div className="chips">
            {bodies.map((b) => (
              <button
                key={b}
                aria-pressed={b === active}
                className={b === active ? 'chip on' : 'chip'}
                onClick={() => setBody(b)}
              >
                {b}
                <span>{b === 'All' ? fits.length : fits.filter((v) => v.body === b).length}</span>
              </button>
            ))}
          </div>
          <div className="grid">
            {shown.map((v) => (
              <VehicleCard key={v.stock} vehicle={v} inputs={inputs} />
            ))}
          </div>
        </>
      )}

      <p className="note">
        {over > 0 && `${over} more ${over === 1 ? 'vehicle is' : 'vehicles are'} above your ceiling. `}
        Inventory updated {new Date(inventory.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
      </p>
    </section>
  );
}
