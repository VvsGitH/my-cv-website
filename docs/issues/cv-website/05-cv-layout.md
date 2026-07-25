# 05 — CV layout components (Paper Mode)

Status: ready-for-agent

## Goal

Build the Sheet layout and all section components so two Sheets reproduce the reference CV pixel-perfect in Paper Mode.

## Tasks

- Sheet composition: Aside (cream panel) + Main (white), consuming content by `sheet`/`column`.
- Header block (Main, Sheet 1): name in Garet-Heavy caps with letter-spacing, subtitle, contact grid (Location/Phone/Email/LinkedIn).
- Aside sections: circular photo over the pale-yellow disc (placeholder until the real photo arrives), About Me, Tech Skills groups, Soft Skills, Languages with proficiency bars, Certifications, Other Info, Privacy + "Bari, `<date>`" + script-font signature.
- Main sections: Experience, Selected Projects, Education — with sub-heading + company + right-aligned muted period, bulleted achievements.
- Section-heading underline rules; exact spacing/leading matched to the screenshots.

## Acceptance

- Side-by-side visual diff against `CV_page1.png` / `CV_page2.png` matches (fonts, colors, spacing, rules, alignment).

## Depends on

- 03, 04

## Comments

Handed over from ticket 04 (content model), so it isn't lost here:

- **`RichText` needs a renderer.** Content strings mark bold runs as
  `**…**` (the reference CV bolds phrases mid-sentence). This ticket owns
  the ~10-line parser that turns that into markup.
- **`SkillGroup.display`** is `'inline'` (slash-separated run, e.g.
  Programming Languages / Development Tools) or `'list'` (bulleted). The
  ` / ` separator is this ticket's choice, not the content's.
- **Section headings come from the content**, on the Block that opens the
  section — that's how Selected Projects prints its title on Sheet 1 and
  continues unheaded on Sheet 2. Don't hardcode headings in components.
- **Proficiency-bar track colour is missing from the spec's token table.**
  Measured off `CV_page2.png`: the filled part is `#737373` (= the existing
  `--color-muted`), but the unfilled track is `#b1c0e1`, a pale blue with
  no token. Add one.
- **`PhotoBlock` carries only `alt`** — the image file itself is this
  ticket's concern (US30: swappable via a file drop, placeholder circle
  until the real photo lands).
