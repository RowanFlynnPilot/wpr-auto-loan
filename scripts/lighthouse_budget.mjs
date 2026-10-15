// Runs Lighthouse against the built site (served on :4173) and fails when a
// category drops under its floor. Scores vary a few points run to run on a
// shared runner, so the floors sit under what the page actually gets (96 /
// 100 in October 2026), not at it.
//
//     node scripts/lighthouse_budget.mjs
//
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const URL = 'http://localhost:4173/wpr-auto-loan/';
const FLOORS = { performance: 0.85, accessibility: 0.95, 'best-practices': 0.9, seo: 0.9 };
const OUT = 'lighthouse.json';

const run = spawnSync(
  'npx',
  [
    'lighthouse', URL, '--quiet', '--output=json', `--output-path=${OUT}`,
    `--only-categories=${Object.keys(FLOORS).join(',')}`,
    '--chrome-flags=--headless=new --no-sandbox',
  ],
  { stdio: 'inherit', shell: true },
);
if (run.status !== 0) {
  console.error(`lighthouse exited ${run.status}`);
  process.exit(1);
}
const report = JSON.parse(await readFile(OUT, 'utf8'));
let failed = false;
for (const [category, floor] of Object.entries(FLOORS)) {
  const score = report.categories[category].score;
  const ok = score >= floor;
  failed ||= !ok;
  console.log(`${ok ? 'ok ' : 'LOW'} ${category.padEnd(15)} ${Math.round(score * 100)} (floor ${Math.round(floor * 100)})`);
}
for (const id of ['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift']) {
  console.log(`    ${id}: ${report.audits[id].displayValue}`);
}
process.exit(failed ? 1 : 0);
