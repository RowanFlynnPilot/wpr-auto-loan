import { useEffect, useMemo, useState } from 'react';
import { Ceiling } from './components/Ceiling';
import { InputsPanel } from './components/InputsPanel';
import { InventoryGrid } from './components/InventoryGrid';
import { TermTable } from './components/TermTable';
import { maxPrice, type LoanInputs } from './lib/loan';
import { decodeInputs, encodeInputs } from './lib/share';
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

// A shared link with a mangled hash falls back to the defaults rather than
// bricking the tool for the reader; the decode error still lands in the console.
function initialInputs(): LoanInputs {
  const hash = window.location.hash.slice(1);
  if (!hash) return DEFAULTS;
  try {
    return decodeInputs(hash);
  } catch (e) {
    console.error(e);
    return DEFAULTS;
  }
}

export default function App() {
  const [inputs, setInputs] = useState<LoanInputs>(initialInputs);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Keep the URL shareable: the current scenario always lives in the hash.
  useEffect(() => {
    history.replaceState(null, '', `#${encodeInputs(inputs)}`);
  }, [inputs]);

  // A shared link opened while the tool is already loaded changes only the
  // hash — no reload — so apply it directly. Our own replaceState writes
  // don't fire hashchange, so this never loops.
  useEffect(() => {
    const apply = () => {
      try {
        setInputs(decodeInputs(window.location.hash.slice(1)));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

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

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      {/* WPR masthead, same as the paper's other tools (Brewers tracker et al.):
          typewriter press seal + wordmark, tagline, dateline between slate rules. */}
      <header className="wpr-masthead">
        <a href="https://wausaupilotandreview.com/" target="_blank" rel="noopener noreferrer" aria-label="Wausau Pilot & Review home">
          <img
            className="badge"
            src={`${import.meta.env.BASE_URL}wpr-typewriter-badge.png`}
            alt=""
            width={42}
            height={42}
          />
          <img
            className="wordmark"
            src="https://wausaupilotandreview.com/wp-content/uploads/2024/04/WausauPilotandReviewLogo.png"
            alt="Wausau Pilot & Review"
          />
        </a>
        <p className="tagline">Where locals look first for news</p>
        <div className="dateline">
          <span>{today}</span>
          <span className="place">Wausau, Wisconsin</span>
        </div>
      </header>

      <div className="app">
      <header className="masthead">
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
          <TermTable
            inputs={inputs}
            price={ceiling}
            onSelectTerm={(termMonths) => setInputs({ ...inputs, termMonths })}
          />
          {loadError && <p className="error">Inventory failed to load: {loadError}</p>}
          {inventory && <InventoryGrid inventory={inventory} inputs={inputs} ceiling={ceiling} />}
        </main>
      </div>

      <footer className="colophon">
        Estimates only. Your rate, fees and trade-in value are set by the lender and dealer at
        purchase. Not financial advice.
      </footer>
      </div>
    </>
  );
}
