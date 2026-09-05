# wpr-auto-loan — "What can I drive?"

Wausau Pilot & Review reader tool. A Wisconsin-seeded auto loan affordability
calculator whose payoff is a sponsoring dealer's live inventory, filtered to
what the reader can actually afford. Built to demo before a dealer is signed.

## Status (Aug 2026)

Demo-complete for the dealer pitch: sponsor pre-approval CTA in the inventory
header, body-type silhouettes on photoless cards (demo only — real feeds carry
photos), shareable scenarios in the URL hash with a copy-a-link button (applied
on load and on hashchange), sample sponsor report at `/report/`, iframe height
messaging for the WordPress embed, clickable term rows, favicon and Open Graph
tags, and the standard WPR masthead (typewriter seal + wordmark, as on the
Brewers tracker) on the tool and the report. Data perspectives: per-vehicle
fuel line (feed mpg × Wausau gas price), ceiling levers, the $25-extra payoff
line, county-income "for scale" context.
Live: https://rowanflynnpilot.github.io/wpr-auto-loan/
Before real launch: register the two Plausible goals (below), swap sponsor.ts
and the feed, attorney check on the Reg Z wording.

## Principles (Rowan's, apply everywhere)

One correct path, no fallbacks. Fail fast and loud. Surgical changes.
No speculative abstraction. Let TypeScript catch it.

## How it works

1. `feed/ingest.py` reads a dealer inventory CSV (`FEED_PATH`) and writes
   `public/inventory.json`. Missing columns or a bad row (non-positive price,
   non-https VDP or photo URL, unknown body, zero mpg, duplicate stock) exits
   non-zero and the build fails. Column mapping lives in `FEED_COLUMNS` at the
   top of the file; the contract is pinned by `feed/test_ingest.py`.
2. `feed/generate_demo.py` writes `feed/demo.csv` — 40 synthetic "Demo Motors"
   vehicles in the same column shape as a HomeNet/vAuto export. Deterministic
   (seeded). Committed so the demo builds with no external dependency.
3. React/Vite app (`src/`) does all loan math client-side in `src/lib/loan.ts`
   (tested in `loan.test.ts`). Reader enters income, share of income, cash
   down, trade-in worth/owed, APR, term → `maxPrice()` back-solves the sticker
   price whose financed amount hits the payment ceiling.
4. `InventoryGrid` shows vehicles under the ceiling, sorted by price, each with
   its own payment computed by our math (never the dealer's number), a Reg Z
   disclosure line, and a tracked link to the dealer's VDP.
5. GitHub Actions runs ingest → test → build → Pages daily and on push.

## Wisconsin seeding — `src/config/wisconsin.ts`

5% state + 0.5% Marathon County sales tax; full trade-in credit against
taxable price. Title $214.50 (Oct 1 2025), lien $10, registration $85,
plate $6, Marathon County wheel tax $25. City of Wausau has no wheel tax.

`FUEL` seeds the per-vehicle gas line: Wausau metro regular average (GasBuddy
via the wpr-gas-prices tracker, dated in the comment) and 1,100 mi/mo (FHWA
average). Combined economy is the EPA 55/45 blend of the feed's own mpg.
`python feed/refresh_gas.py` rewrites `gasPrice` and `gasAsOf` from the
tracker's published JSON; run it by hand when the price drifts and commit. The
build itself stays network-free. `FUEL.gasAsOf` is shown to readers in the
"How we figure this" block, which reads every constant from this config.

`COUNTY_MEDIAN_HOUSEHOLD_INCOME` ($77,884, ACS 5-yr 2020-2024 B19013) powers
the "for scale" line under the price line — the same figure wpr-finance-tools
carries, still `verified:false` there. Editor sign-off before real launch.

## When a dealer signs

- `src/config/sponsor.ts`: name, disclosure label, UTM campaign.
- `feed/ingest.py` `FEED_COLUMNS`: map their column names, and `BODY_ALIASES`:
  map their body labels onto the canonical `BODIES` (which must match
  `BODIES` in `src/components/BodyIcon.tsx`). Unknown bodies and zero mpg fail
  the build on purpose — an EV row needs MPGe/fuel handling before it can ship.
- Workflow: add a step that fetches their feed (SFTP/HTTP) and set `FEED_PATH`.
  Remove the demo feed from the workflow env; leave `generate_demo.py` for the
  next prospect.
- `vite.config.ts` `base` and `index.html` Plausible `data-domain` if the repo
  name or embed domain differ.
- Attorney check on the per-vehicle Reg Z disclosure wording before launch.

## Sponsor report

Plausible custom event `Vehicle click` with props `sponsor, stock, body, price`,
plus UTM params (`utm_source=wausaupilot`, `utm_medium=tool`,
`utm_campaign=<sponsor.ts>`, `utm_content=<stock>`) on every outbound VDP link.
`Preapproval click` (prop `sponsor`) on the header CTA, same UTM treatment with
`utm_content=preapproval`. Report = clicks by vehicle, clicks by body type,
price band readers land in, pre-approval clicks; sample layout at `/report/`.

`Vehicle click` and `Preapproval click` must be added as custom-event goals in
the Plausible dashboard (Site settings → Goals, names matched exactly) before
they show up in reports; Plausible does not backfill events sent earlier. The
loaded `script.outbound-links.js` supports manual `plausible()` calls via the
queue stub in `index.html` — no script change needed for custom events.

## WordPress embed

The tool posts `{type: "wpr-embed-height", id: "wpr-auto-loan", height}` to
its parent whenever its height changes (standard WPR shape). The snippet also
forwards the article's hash into the iframe so a shared scenario link opens
on the article, and passes the article URL as `?host=` so "Copy a link"
produces an article link, not the tool's own URL (only the publisher's domain
is accepted; anything else falls back to the tool URL with a console error).

```html
<div id="wpr-auto-loan"></div>
<script>
(function () {
  var f = document.createElement('iframe');
  f.src = 'https://rowanflynnpilot.github.io/wpr-auto-loan/?host='
    + encodeURIComponent(location.origin + location.pathname) + location.hash;
  f.style.cssText = 'width:100%;border:0;min-height:900px';
  f.allow = 'clipboard-write';
  f.title = 'What can I drive?';
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://rowanflynnpilot.github.io') return;
    if (e.data && e.data.type === 'wpr-embed-height' && e.data.id === 'wpr-auto-loan')
      f.style.height = e.data.height + 'px';
  });
  document.getElementById('wpr-auto-loan').appendChild(f);
})();
</script>
```

## Editorial line

The calculator is neutral and the math is ours. The inventory panel is the
only sponsored surface and is labeled as such. No WPR-written copy praising a
vehicle; feed data (mpg, drivetrain, features) speaks for itself.

## Dev

    python feed/generate_demo.py
    python -m unittest discover -s feed -p "test_*.py"
    $env:FEED_PATH="feed/demo.csv"; python feed/ingest.py
    npm install; npm test; npm run dev
