# Brand faces, self-hosted

Latin subsets of the variable fonts Google Fonts serves, one file per family:

- `fraunces.woff2` — Fraunces (opsz 9–144, wght 400–700)
- `public-sans.woff2` — Public Sans (wght 400–600)
- `jetbrains-mono.woff2` — JetBrains Mono (wght 400–500)

All three are licensed under the SIL Open Font License 1.1. Refresh with
`python scripts/fetch_fonts.py`; the `@font-face` rules are at the top of
`src/styles.css` (and inline in `public/report/index.html`).
