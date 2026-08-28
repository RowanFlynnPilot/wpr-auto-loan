import { useEffect, useMemo, useState } from 'react';
import { Ceiling } from './components/Ceiling';
import { InputsPanel } from './components/InputsPanel';
import { InventoryGrid } from './components/InventoryGrid';
import { TermTable } from './components/TermTable';
import { maxPrice, type LoanInputs } from './lib/loan';
import type { Inventory } from './types';

const DEFAULTS: LoanInputs = {
  monthlyIncome: 5000,
  paymentShare: 0.1,
  downPayment: 2000,
  tradeValue: 0,
  tradeOwed: 0,
  apr: 0.069,
  termMonths: 60,
};

export default function App() {
  const [inputs, setInputs] = useState<LoanInputs>(DEFAULTS);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}inventory.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Inventory>;
      })
      .then(setInventory)
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  const ceiling = useMemo(() => maxPrice(inputs), [inputs]);

  return (
    <div className="app">
      <header className="masthead">
        <p className="eyebrow">A Wausau Pilot &amp; Review tool</p>
        <h1>What can I drive?</h1>
        <p className="lede">
          Enter what you earn and what you can put down. We do the Wisconsin math — sales tax, title,
          plates, the Marathon County wheel tax — and show you what actually fits.
        </p>
      </header>

      <div className="layout">
        <InputsPanel inputs={inputs} onChange={setInputs} />
        <main className="results">
          <Ceiling inputs={inputs} ceiling={ceiling} prices={inventory?.vehicles.map((v) => v.price) ?? []} />
          <TermTable inputs={inputs} price={ceiling} />
          {loadError && <p className="error">Inventory failed to load: {loadError}</p>}
          {inventory && <InventoryGrid inventory={inventory} inputs={inputs} ceiling={ceiling} />}
        </main>
      </div>

      <footer className="colophon">
        Estimates only. Your rate, fees and trade-in value are set by the lender and dealer at
        purchase. Not financial advice.
      </footer>
    </div>
  );
}
