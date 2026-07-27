# 09 — CI build & GitHub Pages deploy

Status: done

## Goal

GitHub Actions pipeline that builds the site, renders the PDFs, and deploys to GitHub Pages.

## Tasks

- Workflow on push to the default branch: checkout → setup Node → `npm ci` → `npx playwright install --with-deps` → `astro build` → run the PDF render script (ticket 08) → assemble site + PDFs → deploy to Pages (`actions/deploy-pages`).
- Enable Pages for the repo; confirm the `base` path serves correctly.
- PDFs are produced in-pipeline and served as static assets (never committed).

## Acceptance

- A push deploys a working site at `<username>.github.io/my-cv-website/` with both locales and both downloadable PDFs.

## Depends on

- 08

## Comments

- Needs the owner's GitHub username to finalize the public URL / any repo settings.
  **Resolved**: `VvsGitH` (the `origin` remote is `VvsGitH/my-cv-website`), and
  ticket 10 already committed it as `site: 'https://vvsgith.github.io'` next to
  `base: '/my-cv-website/'`. The public URL is
  `https://vvsgith.github.io/my-cv-website/`; nothing in the workflow repeats it.

### Implementation notes

`.github/workflows/deploy.yml`, two jobs. `build` runs the exact order ticket 08
left on this ticket's doorstep — `npm ci` →
`npx playwright install --with-deps chromium` → `npm run build` →
`npm run captures:render` — then hands `dist/` to `upload-pages-artifact`;
`deploy` is the standard `deploy-pages` job on the `github-pages` environment.
Chromium only, since the capture script is the sole browser consumer.

**The captures step gates the deploy rather than following it.** It is a job
step before the upload, not a post-deploy job, so a failed capture publishes
nothing — the alternative ships a site whose download control 404s and whose
unfurl has no image. Its own `assertTwoA4Pages` guard (ticket 08) therefore
also fails the *deploy*, which is where a broken 2-page split should be caught.

**"Enable Pages for the repo" stays a manual step — the one task here no
workflow can do.** The first draft carried an `actions/configure-pages` step on
the belief that it would flip the repo's Pages source; code review caught it and
the action's own `action.yml` settles it: `enablement` defaults to `'false'`,
and turning it on "requires a token other than `GITHUB_TOKEN`" (a PAT with
`repo`, or an App with `administration:write`). Handing a static CV site a PAT to
save one click is a bad trade, so the step went out entirely — with `enablement`
off it enables nothing, and nothing in the build reads its outputs, because
`base` is written down in `astro.config.mjs` rather than injected. **The owner
must set Settings → Pages → Source: GitHub Actions once**, or `deploy-pages`
fails. Recorded in the README's Deployment section.

`concurrency: { group: pages, cancel-in-progress: false }` — a superseded deploy
is cheap, a half-uploaded artifact is not. The `permissions` block is the shape
`deploy-pages` documents: `pages: write` for the deployment, `id-token: write`
for the OIDC token it authenticates with.

Action majors, checked against the release feeds on 2026-07-27 rather than from
memory: `checkout@v7` (v7.0.0 2026-06-18), `setup-node@v6`,
`upload-pages-artifact@v5`, `deploy-pages@v5`. Rule applied — newest major that
has had a patch release and a few weeks of soak; that skips `setup-node@v7`,
13 days old and unpatched. Node pinned to 24, the version the site is developed
against and comfortably above the `≥22.12` in `docs/coding-standards.md`.

**Verified by dry run, not by pushing.** The workflow can't be exercised before
it lands, so the failure mode worth ruling out was the build depending on
something that isn't committed — `docs/assets/` (the owner's raw font and photo
drops) is git-ignored, and `scripts/subset-fonts.mjs` reads from it. Cloned the
repo to a scratch directory (committed files only), ran `npm ci` →
`npm run build` → `npm run captures:render`: 4 pages built, both PDFs and both
`og-*.png` written, the A4 guard passing. `subset-fonts.mjs` is a manual,
out-of-band script; the woff2 it produces are committed under `src/assets/`, so
CI never touches `docs/assets/`. Also checked the built `index.html`: every
asset, canonical, `hreflang` and the PDF link is `/my-cv-website/`-prefixed, so
the `base` path serves correctly from the artifact root.

**What that dry run cannot cover, and what closes it.** The acceptance line is
"a push deploys a working site" — the deploy half is unexercised until the owner
flips the Pages setting above and pushes. So the outstanding confirmation is one
owner action: enable Pages, watch the first run, open
`https://vvsgith.github.io/my-cv-website/` and both PDF links. Ticket 12's E2E
suite runs against the built output, not the deployed site, so it will not close
this either.

Not added: a build-only job on pull requests (out of this ticket's scope), and
Playwright browser caching (a chromium download is a minute against a build that
is measured in seconds — cache invalidation is the bigger liability).
