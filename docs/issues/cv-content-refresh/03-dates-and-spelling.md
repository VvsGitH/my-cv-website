# 03 — Date `MM/YYYY` e grafie canoniche delle tecnologie

Status: ready-for-agent

Spec: `docs/issues/cv-content-refresh/spec.md` §2, §3.7, §3.11

## Cosa costruire

Modifiche meccaniche in `it.ts` e `en.ts`, fatte prima dei ticket di contenuto per non riscrivere due volte le stesse righe.

- **Periodi**: `2024.05 - 2024.08` diventa `05/2024 – 08/2024` (en dash `–`, già nel subset). `oggi` / `present` restano parole.
- **Date delle certificazioni**: `2022.12.20` diventa `12/2022`.
- **Grafie**: `JavaScript`, `TypeScript`, `React`, `Next.js`, `RxJS`, `jQuery`, `Tailwind CSS`, `SVN`, `Node.js`, `Express`, `Vite`, `webpack`. Vale per skill, bullet e summary, compreso `tailwind.css` in Beyond Knowledge.
- **Emittente della certificazione**: `WC3x.org` va verificato sul certificato edX (probabilmente `W3Cx`). Si corregge solo dopo averlo verificato.

## Criteri di accettazione

- [ ] Nessuna data nel formato `YYYY.MM` in `src/content/`.
- [ ] Nessuna delle grafie errate elencate compare in `src/content/`.
- [ ] 2 pagine A4 per ogni PDF, e nessuna riga va a capo in un punto nuovo nei Block `KEEP TIGHT` (controllo visivo di Sheet 1 Main in IT).
- [ ] `npm test` verde. Se qualche test controlla una data o una grafia vecchia, si aggiorna il test.

## Comments
