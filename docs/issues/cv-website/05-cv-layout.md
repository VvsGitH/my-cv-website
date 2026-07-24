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
