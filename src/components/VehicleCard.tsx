import { SPONSOR } from '../config/sponsor';
import { FUEL } from '../config/wisconsin';
import { count, dollars, percent } from '../lib/format';
import { fuelPerMonth } from '../lib/fuel';
import { BodyIcon } from './BodyIcon';
import { maxPayment, quote, type LoanInputs } from '../lib/loan';
import { trackVehicleClick, vdpLink } from '../lib/track';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  inputs: LoanInputs;
}

export function VehicleCard({ vehicle: v, inputs }: Props) {
  const q = quote(v.price, inputs);
  const budget = maxPayment(inputs);
  const share = budget > 0 ? q.payment / budget : 0;
  return (
    <article className="card">
      {v.photoUrl ? (
        <img src={v.photoUrl} alt={`${v.year} ${v.make} ${v.model}`} loading="lazy" />
      ) : (
        <div className="photo-blank" aria-hidden="true">
          <BodyIcon body={v.body} />
          <span>{v.make}</span>
        </div>
      )}
      <div className="body">
        <h3>
          {v.year} {v.make} {v.model} <small>{v.trim}</small>
        </h3>
        <p className="meta">
          {count(v.mileage)} mi · {v.drivetrain} · {v.mpgCity}/{v.mpgHwy} mpg · {v.exteriorColor}
        </p>
        <div className="money">
          <span className="payment">
            {dollars(q.payment)}<small>/mo</small>
          </span>
          <span className="price">{dollars(v.price)}</span>
        </div>
        {budget > 0 && (
          <p className="budget">
            <span className="budget-bar" aria-hidden="true">
              <span style={{ width: `${Math.min(100, share * 100)}%` }} />
            </span>
            {Math.round(share * 100)}% of your {dollars(budget)}/mo budget
          </p>
        )}
        <p className="fuel">
          + about {dollars(fuelPerMonth(v.mpgCity, v.mpgHwy))}/mo in gas — {count(FUEL.milesPerMonth)} mi
          at Wausau's ${FUEL.gasPrice.toFixed(2)}/gal
        </p>
        {/* Reg Z: payment shown with the terms that produce it. */}
        <p className="disclosure">
          {q.termMonths} months at {percent(inputs.apr)} APR with {dollars(inputs.downPayment)} down
          {inputs.tradeValue > 0 && ` and a ${dollars(inputs.tradeValue)} trade-in`}. Estimate includes
          Wisconsin tax and fees; {dollars(q.financed)} financed.
        </p>
        <ul className="features">
          {v.features.slice(0, 4).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <a
          className="vdp"
          href={vdpLink(v)}
          target="_blank"
          rel="noopener sponsored"
          onClick={() => trackVehicleClick(v)}
        >
          See it at {SPONSOR.name} <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}
