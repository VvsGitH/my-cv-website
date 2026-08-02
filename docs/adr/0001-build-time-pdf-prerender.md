# Build-time pre-rendering of the downloadable PDF

The downloadable CV PDF is produced at **build time** by a headless Chromium (Playwright `page.pdf()`) that opens the very same built page and captures it, rather than being generated on-demand at runtime or in the browser. This gives byte-stable, identical-for-everyone output with maximum fidelity (the same rendering engine and CSS that draw the screen) and — critically — needs **no server or serverless infrastructure**, so the whole site can be hosted as static files on GitHub Pages.

## Considered Options

- **Runtime generation** (serverless headless Chromium per request) — same fidelity but requires hosting that can run Chromium, adds latency and infra for zero benefit on a fixed document.
- **Client-side libraries** (`jsPDF`, `html2canvas`, `@react-pdf/renderer`) — rejected: they either rasterize (blurry, not real text) or use a separate non-HTML renderer, both of which break the "real HTML, pixel-perfect" requirement.

## Consequences

- The PDF only changes on rebuild — acceptable, since editing content already implies a redeploy.
- The build needs headless Chromium in CI (`npx playwright install --with-deps`).
- One PDF is rendered **per Locale**.
- Byte-level reproducibility (qpdf, `SOURCE_DATE_EPOCH`) is deliberately skipped: the PDF is generated fresh in CI and never committed, so noisy diffs never arise.
- **The capture is a recipe, not a call.** Every step in `scripts/render-captures.mjs` — the viewport, its ordering against `goto`, the print emulation, the image decode — exists because the alternative fails silently. **ADR-0009** records each one; read it before touching that script.
- **Screen/PDF parity is provable, and was proved**: inflate both renderings' content streams and diff every positioned drawing operator. Both Locales came out with all 8112 operators identical. Reach for this whenever a change touches the `print` layer or the Sheet geometry.
- **This ADR is why `text-box-trim` is refused** (ADR-0011): Firefox has not shipped it, so Chromium would capture the PDF tighter than Firefox renders the screen — the exact drift this decision exists to prevent. Any feature with that asymmetry falls the same way.
