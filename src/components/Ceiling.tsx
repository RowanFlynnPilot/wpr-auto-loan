import { useLayoutEffect, useRef, useState } from 'react';
import { maxPayment, purchaseFees, quote, type LoanInputs } from '../lib/loan';
import { cents, dollars, percent } from '../lib/format';

interface Props {
  inputs: LoanInputs;
  ceiling: number;
  prices: number[];
}

export function Ceiling({ inputs, ceiling, prices }: Props) {
  const q = quote(ceiling, inputs);
  return (
    <section className="ceiling">
      <p className="label">You can shop up to</p>
      <p className="figure">{dollars(ceiling)}</p>
      <p className="basis">
        {dollars(maxPayment(inputs))} a month for {inputs.termMonths} months at {percent(inputs.apr)} APR.
        That price carries {cents(q.salesTax)} in sales tax and {cents(purchaseFees())} in title, plate,
        registration and Marathon County wheel tax, so you'd finance {dollars(q.financed)}.
      </p>
      <PriceLine ceiling={ceiling} prices={prices} />
    </section>
  );
}

// Every vehicle in the lot as a dot on a price line, with the ceiling marked.
function PriceLine({ ceiling, prices }: { ceiling: number; prices: number[] }) {
  const ref = useRef<HTMLElement>(null);
  const [W, setW] = useState(640);
  useLayoutEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(320, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 84;
  const PAD = 24;
  const top = Math.max(ceiling, ...prices, 10_000);
  const domain = Math.ceil(top / 10_000) * 10_000;
  const x = (price: number) => PAD + (price / domain) * (W - PAD * 2);
  const ticks = Array.from({ length: domain / 10_000 + 1 }, (_, k) => k * 10_000);
  const under = prices.filter((p) => p <= ceiling).length;

  return (
    <figure className="priceline" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} height={H} role="img" aria-label={`${under} of ${prices.length} vehicles under your ceiling`}>
        <line x1={PAD} y1={52} x2={W - PAD} y2={52} className="axis" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={48} x2={x(t)} y2={56} className="axis" />
            <text x={x(t)} y={74} textAnchor="middle" className="tick">
              {t === 0 ? '$0' : `$${t / 1000}k`}
            </text>
          </g>
        ))}
        {prices.map((p, k) => (
          <circle
            key={k}
            cx={x(p)}
            cy={36 + ((k % 5) - 2) * 4.5}
            r={4}
            className={p <= ceiling ? 'dot in' : 'dot out'}
          />
        ))}
        <line x1={x(ceiling)} y1={8} x2={x(ceiling)} y2={58} className="marker" />
        <text x={x(ceiling)} y={0} dy={6} textAnchor={ceiling / domain > 0.85 ? 'end' : 'middle'} className="marker-label">
          your ceiling
        </text>
      </svg>
      <figcaption>
        {under} of {prices.length} vehicles in the lot are under your ceiling.
      </figcaption>
    </figure>
  );
}
