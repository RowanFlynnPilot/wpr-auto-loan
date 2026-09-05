import { useState, type ComponentProps } from 'react';
import { TERMS, maxPayment, type LoanInputs } from '../lib/loan';
import { dollars } from '../lib/format';

// Shows the raw text while the field is being edited so backspacing to empty
// doesn't snap to 0 mid-keystroke. A keystroke commits its parsed value only
// when there is one — an empty field (including the browser's "" for a
// half-typed "6.") keeps the previous value rather than flashing 0 through
// the math — and blur restores the canonical number.
function NumericInput({
  canonical,
  commit,
  ...inputProps
}: { canonical: string; commit: (raw: string) => void } & Omit<
  ComponentProps<'input'>,
  'type' | 'value' | 'onChange' | 'onBlur'
>) {
  const [text, setText] = useState<string | null>(null);
  return (
    <input
      {...inputProps}
      type="number"
      value={text ?? canonical}
      onChange={(e) => {
        setText(e.target.value);
        if (e.target.value.trim() !== '') commit(e.target.value);
      }}
      onBlur={() => setText(null)}
    />
  );
}

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
            <NumericInput
              inputMode="decimal"
              min={0}
              max={30}
              step={0.1}
              canonical={String(Number((inputs.apr * 100).toFixed(2)))}
              commit={(raw) => set('apr', Math.max(0, Number(raw) || 0) / 100)}
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
      <NumericInput
        inputMode="numeric"
        min={0}
        step={100}
        canonical={String(value)}
        commit={(raw) => onChange(Math.max(0, Number(raw) || 0))}
      />
    </span>
  );
}
