# Wordoria Lexicon Audit

Updated: 2026-08-06

## Coverage

- Total merged Wordoria words: 1113
- Verified exam rows: 700
- Curated visual / advanced learning words already covered in app/page.tsx: 501 IPA entries
- Display fallback to automatic guessed IPA: removed
- Current unresolved required fields: 0

## Sources And Policy

- Initial exam-word IPA, part of speech, and English definitions were seeded from Free Dictionary API: https://dictionaryapi.dev/
- 54 entries that the API did not fully resolve were manually completed in app/verified-exam-lexicon.ts.
- Existing Wordoria visual-learning definitions remain curated for the visual journal and practice experience.
- Chinese glosses for exam words remain Wordoria's short study glosses from the CET / Contest source list.
- Several heteronyms show two pronunciations, for example noun / verb pairs such as graduate, permit, survey, reject, and subordinate.

## Guardrail

Run `pnpm run validate:lexicon` before release. GitHub Pages builds also run this check through `build:github`.