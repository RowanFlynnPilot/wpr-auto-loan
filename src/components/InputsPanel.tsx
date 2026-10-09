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
        <Money name="income" value={inputs.monthlyIncome} onChange={(v) => set('monthlyIncome', v)} />
      </label>

      <div className="share">
        <label>
          <span>
            Share of income for the payment <em>{Math.round(inputs.paymentShare * 100)}%</em>
          </span>
          <input
            type="range"
            name="share"
            min={5}
            max={20}
            step={1}
            value={Math.round(inputs.paymentShare * 100)}
            aria-valuetext={`${Math.round(inputs.paymentShare * 100)}% of income, ${dollars(maxPayment(inputs))} a month`}
            onChange={(e) => set('paymentShare', Number(e.target.value) / 100)}
          />
        </label>
        {/* The same number from the other side: a reader who thinks in payments
            types one and the share follows. Bounded at the whole income, which
            is also the bound a shared link accepts; with no income there is no
            share to derive, so the field waits. */}
        <label className="pay">
          <span>Or a monthly payment</span>
          <Money
            name="payment"
            value={Math.round(maxPayment(inputs))}
            disabled={inputs.monthlyIncome <= 0}
            onChange={(v) => set('paymentShare', Math.min(v / inputs.monthlyIncome, 1))}
          />
        </label>
        <small>10% of gross income is a common ceiling for the payment alone.</small>
      </div>

      <label>
        <span>Cash down</span>
        <Money name="down" value={inputs.downPayment} onChange={(v) => set('downPayment', v)} />
      </label>

      <div className="pair">
        <label>
          <span>Trade-in worth</span>
          <Money name="trade" value={inputs.tradeValue} onChange={(v) => set('tradeValue', v)} />
        </label>
        <label>
          <span>Still owed on it</span>
          <Money name="owed" value={inputs.tradeOwed} onChange={(v) => set('tradeOwed', v)} />
        </label>
      </div>

      <div className="pair">
        <label>
          <span>APR</span>
          <span className="field">
            <NumericInput
              name="apr"
              autoComplete="off"
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
          <select name="term" value={inputs.termMonths} onChange={(e) => set('termMonths', Number(e.target.value))}>
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

function Money({
  name,
  value,
  disabled,
  onChange,
}: {
  name: string;
  value: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <span className="field">
      <b>$</b>
      <NumericInput
        name={name}
        autoComplete="off"
        disabled={disabled}
        inputMode="numeric"
        min={0}
        step={100}
        canonical={String(value)}
        commit={(raw) => onChange(Math.max(0, Number(raw) || 0))}
      />
    </span>
  );
}
