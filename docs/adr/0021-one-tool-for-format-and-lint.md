# One tool for format and lint, and what it does not reach

Formatting and linting are Biome, configured in `biome.jsonc` and run with `npm run lint`. There is no Prettier and no ESLint, and there will not be a second formatter alongside it.

Until now the project had **neither**. `astro check` and the Playwright suite were the only gates, and the absence showed: 134 imports quoted singly against three quoted doubly, `src/i18n/locale.ts` alone in using double quotes *and* no trailing comma. Nothing was migrated here, because there was nothing to migrate.

## Considered Options

- **Prettier + `prettier-plugin-astro`**, which is what `docs/coding-standards.md` prescribed before this ADR and what the Astro docs recommend (`docs/research/astro-coding-standards.md`). It is the only option that formats the `.astro` frontmatter, and it is the safe answer. Rejected because it formats and nothing else: the linting half would still be an open question, and answering it with ESLint means a second config, a second dependency tree and a shared boundary to keep the two from fighting over the same files.
- **Biome for `.ts`/`.tsx`/`.css`/`.json`, Prettier for the 23 `.astro`.** The hybrid. Rejected for the same reason in a smaller package — two formatters, two configs, and indent width, quote style and line width written down twice in the hope they stay equal.
- **Biome with `.astro` left partly formatted.** The default, and honest about the experimental flags. Rejected because `.astro` is half the source files; a formatter that skips half the repo is a formatter people stop trusting.

## What Biome actually reaches inside a `.astro` file

Measured, not assumed, on 2.5.12, and the reason this ADR is worth its length:

- **`html.experimentalFullSupportEnabled` alone formats nothing.** It buys linting of the templates and import sorting in the frontmatter. The formatter is gated a second time, behind `html.formatter.enabled`; both have to be on.
- **With both on, the frontmatter TypeScript is still not formatted.** A mangled `interface   Props   {` survives `biome check --write` untouched. The template, its `<style>`, and the import order are formatted; the code above the second `---` is not.

So the `.astro` frontmatter is the one place in this repo where formatting is still a convention rather than a rule. That is the price of the single tool, and it is written here so nobody re-derives it from a confusing diff.

Both flags are experimental and Biome will remove them once its HTML parser stabilises. **Remove them then** rather than leaving them to rot — the day `biome` rejects the keys is the day this paragraph pays for itself.

## Consequences

- **The config is `biome.jsonc`, not `biome.json`.** Comments in a `biome.json` make Biome fall back to its defaults **silently** — no warning, no error, and a `check` run that looks like it worked. That failure cost a debugging detour here; the `.jsonc` extension is what prevents the next one. This repo explains its non-obvious choices in place, so a config it cannot comment in is not an option.
- **No CI step and no pre-commit hook**, in the spirit of ADR-0010. `deploy.yml` is the only workflow and it runs on push to `master`, so there is no PR gate to hang `biome ci` on, and inventing one — or a husky/lint-staged tree the repo has never had — would add a fourth gate to a project that deliberately keeps one. `npm run lint` is a command, not a checkpoint. Add the CI step when there is a CI to add it to.
- **biome-ignore rules added to false positives and required exceptions.** Toolbar.tsx, icons.css, reset.css.
- **`assets` and `docs` are excluded.** No need to format those.
- The first formatting pass is its own commit, so `git blame` on 31 files still points at whoever wrote the line.
