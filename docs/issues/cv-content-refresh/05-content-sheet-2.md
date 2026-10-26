# 05 — Contenuto di Sheet 2: "Come lavoro", progetti, lingue, altre info, privacy, formazione

Status: blocked — da 02 (progetti slim) e 03 (date e grafie)

Spec: `docs/issues/cv-content-refresh/spec.md` §3.6–§3.10, §4.1, §6 (decisioni D2, D5, D6, D10, D15, D16, D19)

## Cosa costruire

In `it.ts` e `en.ts`:

- **"Come lavoro"** / **"How I work"** al posto di *Soft skills*: stesso `BulletsBlock`, stessa posizione, stesso `readOrder`. Le voci sono quelle della bozza in spec §6. Le voci che il ticket 04 non è riuscito a mettere in Sheet 1 Aside finiscono qui.
- **Progetti completi** (RUOP, B2B Environment): bullet riscritti con la formula XYZ e al participio. Si tolgono i bullet generici ("Gestione del repository GitHub", "Documentazione tecnica e testing") o si fondono in un bullet specifico. N6/N7 se disponibili.
- **Lingue**: *"B2 certificato, C1 d'uso"* / *"B2 certified, C1 in daily use"* (D16). Si verifica che il testo stia accanto alla barra in `LanguagesBlock`. Se va a capo, si sistema il layout e si aggiorna il commento `level` in `types.ts`.
- **Altre info**: patente e automunito restano (D5). Si toglie "Disponibile al trasferimento" (D15). Nuova riga IT: *"Preferenza per il lavoro da remoto; disponibile per posizioni ibride in Italia, senza cambio di residenza."* In EN la stessa riga, più *"Based in Bari, Italy (CET). EU citizen."*
- **Privacy**: la formula completa con il D.Lgs. 196/2003 (spec §3.10). In EN la stessa clausola, tradotta.
- **Formazione**: il diploma resta (D2). In EN `EQF Level: 6` diventa *"Bachelor's degree (EQF 6)"*, e la tesi si può ridurre al titolo.

## Criteri di accettazione

- [ ] Nessun blocco *Soft skills* in nessuna delle due Locale. "Come lavoro" occupa la stessa posizione.
- [ ] Ogni bullet dei progetti completi apre con un verbo d'azione.
- [ ] "Disponibile al trasferimento" non compare più.
- [ ] Sheet 2 Aside e Sheet 2 Main restano nel foglio: 2 pagine A4 per tutti e 4 i PDF.
- [ ] Stessi fatti in IT ed EN.
- [ ] `npm test` verde, e controllo visivo di Paper e Reading Mode in IT ed EN.

## Comments
