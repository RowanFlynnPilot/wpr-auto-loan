# wpr-auto-loan — "What can I drive?"

Wausau Pilot & Review reader tool. A Wisconsin-seeded auto loan affordability
calculator whose payoff is a sponsoring dealer's live inventory, filtered to
what the reader can actually afford. Built to demo before a dealer is signed.

## Principles (Rowan's, apply everywhere)

One correct path, no fallbacks. Fail fast and loud. Surgical changes.
No speculative abstraction. Let TypeScript catch it.

## How it works

1. `feed/ingest.py` reads a dealer inventory CSV (`FEED_PATH`) and writes
   `public/inventory.json`. Missing columns or a bad row exits non-zero and
   the build fails. Column mapping lives in `FEED_COLUMNS` at the top of the file.
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

## When a dealer signs

- `src/config/sponsor.ts`: name, disclosure label, UTM campaign.
- `feed/ingest.py` `FEED_COLUMNS`: map their column names. Nothing else changes.
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

## Editorial line

The calculator is neutral and the math is ours. The inventory panel is the
only sponsored surface and is labeled as such. No WPR-written copy praising a
vehicle; feed data (mpg, drivetrain, features) speaks for itself.

## Dev

    python feed/generate_demo.py
    $env:FEED_PATH="feed/demo.csv"; python feed/ingest.py
    npm install; npm test; npm run dev
