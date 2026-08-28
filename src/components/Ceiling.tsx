import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { COUNTY_MEDIAN_HOUSEHOLD_INCOME } from '../config/wisconsin';
import { ceilingLevers, maxPayment, maxPrice, purchaseFees, quote, type LoanInputs } from '../lib/loan';
import { cents, dollars, percent } from '../lib/format';

// Eases the displayed figure toward its new value over ~250ms so the number
// visibly reacts to the inputs. Display-only — every other line uses the real
// ceiling. Jumps straight to the target under prefers-reduced-motion.
function useCountUp(target: number): number {
  const [shown, setShown] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(target);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / 250, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

// The scenario always lives in the URL hash; this just makes that shareable
// link discoverable. Clipboard access can be denied inside an embed, so fall
// back to showing the link for a manual copy.
function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="copylink"
      onClick={() =>
        navigator.clipboard.writeText(window.location.href).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          },
          () => window.prompt('Copy this link:', window.location.href),
        )
      }
    >
      {copied ? 'Link copied' : 'Copy a link to this scenario'}
    </button>
  );
}

export interface LotDot {
  label: string;
  price: number;
}

interface Props {
  inputs: LoanInputs;
  ceiling: number;
  lot: LotDot[];
}

export function Ceiling({ inputs, ceiling, lot }: Props) {
  const q = quote(ceiling, inputs);
  const levers = ceilingLevers(inputs);
  const figure = useCountUp(ceiling);
  return (
    <section className="ceiling">
      <p className="label">You can shop up to</p>
      <p className="figure">{dollars(figure)}</p>
      <p className="basis">
        {dollars(maxPayment(inputs))} a month for {inputs.termMonths} months at {percent(inputs.apr)} APR.
        That price carries {cents(q.salesTax)} in sales tax and {cents(purchaseFees())} in title, plate,
        registration and Marathon County wheel tax, so you'd finance {dollars(q.financed)}.
      </p>
      <p className="levers">
        To raise it: another $500 down adds {dollars(levers.down500)}
        {levers.aprPoint !== null && <> · a point less APR adds {dollars(levers.aprPoint)}</>}
        {levers.nextTerm && (
          <>
            {' '}· {levers.nextTerm.termMonths - inputs.termMonths} more months adds {dollars(levers.nextTerm.delta)}
          </>
        )}
        .
      </p>
      <CopyLink />
      <PriceLine ceiling={ceiling} lot={lot} />
      <p className="note">
        For scale: the median Marathon County household earns about{' '}
        {dollars(COUNTY_MEDIAN_HOUSEHOLD_INCOME / 12)} a month before taxes (Census ACS); shopping your
        same way, its ceiling is about {dollars(maxPrice({ ...inputs, monthlyIncome: COUNTY_MEDIAN_HOUSEHOLD_INCOME / 12 }))}.
      </p>
    </section>
  );
}

// Every vehicle in the lot as a dot on a price line, with the ceiling marked.
function PriceLine({ ceiling, lot }: { ceiling: number; lot: LotDot[] }) {
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
  const top = Math.max(ceiling, ...lot.map((d) => d.price), 10_000);
  const domain = Math.ceil(top / 10_000) * 10_000;
  const x = (price: number) => PAD + (price / domain) * (W - PAD * 2);
  const ticks = Array.from({ length: domain / 10_000 + 1 }, (_, k) => k * 10_000);
  const under = lot.filter((d) => d.price <= ceiling).length;

  return (
    <figure className="priceline" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} height={H} role="img" aria-label={`${under} of ${lot.length} vehicles under your ceiling`}>
        <line x1={PAD} y1={52} x2={W - PAD} y2={52} className="axis" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={48} x2={x(t)} y2={56} className="axis" />
            <text x={x(t)} y={74} textAnchor="middle" className="tick">
              {t === 0 ? '$0' : `$${t / 1000}k`}
            </text>
          </g>
        ))}
        {lot.map((d, k) => (
          <circle
            key={k}
            cx={x(d.price)}
            cy={36 + ((k % 5) - 2) * 4.5}
            r={4}
            className={d.price <= ceiling ? 'dot in' : 'dot out'}
          >
            <title>{`${d.label} — ${dollars(d.price)}`}</title>
          </circle>
        ))}
        <line x1={x(ceiling)} y1={8} x2={x(ceiling)} y2={58} className="marker" />
        <text x={x(ceiling)} y={0} dy={6} textAnchor={ceiling / domain > 0.85 ? 'end' : 'middle'} className="marker-label">
          your ceiling
        </text>
      </svg>
      <figcaption>
        {under} of {lot.length} vehicles in the lot are under your ceiling.
      </figcaption>
    </figure>
  );
}
