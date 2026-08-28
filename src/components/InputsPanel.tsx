import { TERMS, maxPayment, type LoanInputs } from '../lib/loan';
import { dollars } from '../lib/format';

interface Props {
  inputs: LoanInputs;
  onChange: (next: LoanInputs) => void;
}

export function InputsPanel({ inputs, onChange }: Props) {
  const set = <K extends keyof LoanInputs>(key: K, value: LoanInputs[K]) =>
    onChange({ ...inputs, [key]: value });

  return (
    <aside className="inputs">
      <label>
        <span>Monthly income, before taxes</span>
        <Money value={inputs.monthlyIncome} onChange={(v) => set('monthlyIncome', v)} />
      </label>

      <label>
        <span>
          Share for a car payment <em>{Math.round(inputs.paymentShare * 100)}% · {dollars(maxPayment(inputs))}/mo</em>
        </span>
        <input
          type="range"
          min={5}
          max={20}
          step={1}
          value={Math.round(inputs.paymentShare * 100)}
          onChange={(e) => set('paymentShare', Number(e.target.value) / 100)}
        />
        <small>10% of gross income is a common ceiling for the payment alone.</small>
      </label>

      <label>
        <span>Cash down</span>
        <Money value={inputs.downPayment} onChange={(v) => set('downPayment', v)} />
      </label>

      <div className="pair">
        <label>
          <span>Trade-in worth</span>
          <Money value={inputs.tradeValue} onChange={(v) => set('tradeValue', v)} />
        </label>
        <label>
          <span>Still owed on it</span>
          <Money value={inputs.tradeOwed} onChange={(v) => set('tradeOwed', v)} />
        </label>
      </div>

      <div className="pair">
        <label>
          <span>APR</span>
          <span className="field">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={30}
              step={0.1}
              value={Number((inputs.apr * 100).toFixed(2))}
              onChange={(e) => set('apr', Number(e.target.value) / 100)}
            />
            <b>%</b>
          </span>
        </label>
        <label>
          <span>Term</span>
          <select value={inputs.termMonths} onChange={(e) => set('termMonths', Number(e.target.value))}>
            {TERMS.map((t) => (
              <option key={t} value={t}>
                {t} months
              </option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  );
}

function Money({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="field">
      <b>$</b>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={100}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      />
    </span>
  );
}
