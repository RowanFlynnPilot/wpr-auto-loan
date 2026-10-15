import { useEffect, useMemo, useState } from 'react';
import { Ceiling } from './components/Ceiling';
import { Colophon } from './components/Colophon';
import { InputsPanel } from './components/InputsPanel';
import { InventoryGrid } from './components/InventoryGrid';
import { PitchRibbon } from './components/PitchRibbon';
import { TermTable } from './components/TermTable';
import { maxPrice, type LoanInputs } from './lib/loan';
import { DEFAULTS } from './config/scenario';
import { PITCH } from './config/sponsor';
import { DEFAULT_VIEW, SETTLE_MS, decodeInputs, decodeView, encodeState, type View } from './lib/share';
import type { Inventory } from './types';

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

function initialView(): View {
  try {
    return decodeView(window.location.hash.slice(1));
  } catch (e) {
    console.error(e);
    return DEFAULT_VIEW;
  }
}

export default function App() {
  const [inputs, setInputs] = useState<LoanInputs>(initialInputs);
  const [view, setView] = useState<View>(initialView);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Keep the URL shareable: the current scenario and view always live in the
  // hash, written once the inputs have rested (see SETTLE_MS) rather than per
  // keystroke. Copy-a-link uses the same encoding directly, so it never reads
  // a hash that is still pending.
  const hash = encodeState(inputs, view);
  useEffect(() => {
    const t = setTimeout(() => history.replaceState(null, '', `#${hash}`), SETTLE_MS);
    return () => clearTimeout(t);
  }, [hash]);

  // A shared link opened while the tool is already loaded changes only the
  // hash — no reload — so apply it directly. Our own replaceState writes
  // don't fire hashchange, so this never loops.
  useEffect(() => {
    const apply = () => {
      try {
        setInputs(decodeInputs(window.location.hash.slice(1)));
        setView(decodeView(window.location.hash.slice(1)));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}${PITCH?.inventoryFile ?? 'inventory.json'}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Inventory>;
      })
      .then(setInventory)
      .catch((e: Error) => {
        console.error(e); // the status code is for us, not for the reader
        setLoadError(e.message);
      });
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
      {/* The hash is the scenario's, so this focuses the results instead of navigating. */}
      <a
        className="skip"
        href="#results"
        onClick={(e) => {
          e.preventDefault();
          const results = document.getElementById('results');
          results?.focus();
          results?.scrollIntoView();
        }}
      >
        Skip to your ceiling
      </a>
      <PitchRibbon />
      {/* WPR masthead, same as the paper's other tools (Brewers tracker et al.):
          typewriter press seal + wordmark, tagline, dateline between slate rules.
          index.html paints a copy of this and the title before React loads;
          a change here is a change there. */}
      <header className="wpr-masthead">
        <a href="https://wausaupilotandreview.com/" target="_blank" rel="noopener noreferrer" aria-label="Wausau Pilot & Review home">
          <img
            className="badge"
            src={`${import.meta.env.BASE_URL}wpr-typewriter-badge.png`}
            alt=""
            width={62}
            height={62}
            decoding="async"
          />
          <img
            className="wordmark"
            src={`${import.meta.env.BASE_URL}wpr-wordmark.png`}
            alt="Wausau Pilot & Review"
            width={640}
            height={82}
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
        <main className="results" id="results" tabIndex={-1}>
          <Ceiling
            inputs={inputs}
            hash={hash}
            ceiling={ceiling}
            lot={inventory?.vehicles.map((v) => ({ label: `${v.year} ${v.make} ${v.model}`, price: v.price })) ?? []}
            onUseIncome={(monthlyIncome) => setInputs({ ...inputs, monthlyIncome })}
          />
          <TermTable
            inputs={inputs}
            price={ceiling}
            onSelectTerm={(termMonths) => setInputs({ ...inputs, termMonths })}
          />
          {loadError && (
            <p className="error">
              The lot didn&rsquo;t load, so we can&rsquo;t show which vehicles fit. Your ceiling and the
              payment math above are unaffected — try again in a few minutes.
            </p>
          )}
          {!inventory && !loadError && <p className="loading">Loading the lot…</p>}
          {inventory && (
            // Keyed on the view so a new filter or sort starts the paging over.
            <InventoryGrid
              key={`${view.body}|${view.sort}`}
              inventory={inventory}
              inputs={inputs}
              ceiling={ceiling}
              view={view}
              onView={setView}
            />
          )}
        </main>
      </div>

      <Colophon />
      </div>
    </>
  );
}
