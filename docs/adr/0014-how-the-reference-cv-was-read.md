# How the reference CV was read, and which of its flaws are preserved

Every geometry and type number in `tokens.css` was **measured out of the reference**, not estimated. This ADR records the method, so a number can be re-derived rather than guessed at, and records the deliberate infidelities — the places where the site does not match the reference and should not be "fixed".

The reference is the owner's original Canva CV: `docs/assets/CV_page1.png` / `CV_page2.png` and the PDF beside them (git-ignored, ADR-0012).

## The method

- **The screenshots are 794×1123px — A4 at exactly 96dpi — so 1px in the reference is 1 CSS px.** That alone settles most spacing questions.
- **The PDF's content streams give exact geometry.** Inside each page's form XObject, **page units ÷ 3.126178 are CSS px** in a top-left origin space. Every number below was read off those operators rather than eyeballed: the Aside panel at `x=17.7 w=265.6 h=1103.1`, its text column at `x=37.8 w=226.8` with heading rules running 245.4px past the text to the panel's own edge; Main at `x=321.7 w=435.8`; the 176.4px photo disc centred at `cy=126`; contacts as three 145px columns 36px apart.
- **The PDF's text operands are unusable.** Canva embeds subset fonts with custom glyph encodings, so `Tj` operands decode to garbage. The copy was transcribed from the PNGs at 3× crops.
- **Two things the screenshots do not carry were recovered from the PDF's `/URI` annotations**: the LinkedIn profile URL and the edX link on the accessibility certificate.
- **Language proficiency was measured off the bar pixels**: Italian fills the track (1.0), English stops at 158/226 (0.7).
- **Punctuation was settled from the PDF's 11 `/ToUnicode` CMaps**, which is exact where a 798px screenshot is not — a curly quote and a straight one are a pixel apart there. `“ ”` are present and `"` appears nowhere; `—` is present; **U+2026 is absent, so "and more…" is really three periods.** Apostrophes are genuinely mixed in the source (U+0027 on one Sheet, U+2019 on the other, in both families) and were normalised to `’`.
- **The role-to-face mapping was read out of the PDF's font resources.** An earlier pass inferred it by rendering comparison against the screenshots and got Now and Garet swapped (ADR-0012).
- **The type scale needs two "body" sizes** because the source draws its display lines straight on the page but its prose inside forms carrying their own ~2.7788 scale — so a `12 Tf` means 12px in one place and 10.67px in the other.

## Deliberate infidelities

These are settled. Do not chase them as bugs.

- **B2B Environment's bullets wrap differently, about −20px by the foot of Sheet 1.** Canva sized that one text box 396px wide where its neighbours are ~423–430px. Matching it would mean per-Block widths in the content, which is layout leaking into content.
- **The certification link icon falls to its own line**, where the reference wraps the title instead.
- **Spacing and prose leading do not match the reference at all**, by design — ADR-0011 supersedes it on that axis.
- **Six transcription quirks are preserved verbatim.** They are the owner's text, not ours to correct, and a reviewer or spellchecker *will* try: `WC3x.org` (the issuer's site is `W3Cx.org`), "Coordination of the **fronted** team", "based **of** Microsoft Power Apps", "**Boostrap** 4", "in **an** scrum based project", and "A2A S.p.a" with no closing period beside "Leonardo S.p.a.".

## Consequences

- **The email is not underlined; web links are.** Settled by a pixel scan — LinkedIn's value has a full-width dark row at y=226, the email's has none — and defensible on its own merits, since the LinkedIn text is a name rather than an address.
- **`aria-hidden` on the signature** is deliberate: a decorative rendering of a name the `<h1>` already announces.
- Two section gaps are compromises rather than measurements: the reference's own values differ between Sheets (39.4/38.3px on Sheet 1 against 15.7/23.6/40.1px on Sheet 2), so one constant cannot hit both. Sheet 1 was favoured, being denser. This predates ADR-0011, which now governs the spacing anyway.
- **The Italian scaffold was left empty rather than copied from English**, so a missing translation rendered as visibly missing instead of shipping silently. Two fields were exempted: the photo `alt` (an empty `alt` means "decorative" and fails silently, the opposite of the point) and the one period carrying a word rather than digits.
