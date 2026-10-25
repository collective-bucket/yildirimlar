# AGENTS

- "yayınla" = `npm run check && npm run stamp && npm run deploy` from the repo root (hosting only). `firebase` is the local devDependency; use npm scripts or `npx firebase`.
- Every new `data-i18n` key needs a Turkish string in `public/assets/i18n.js`; `npm run check` fails on missing or unused keys.
- Data JSON text fields are `{ en, tr }`.
- Never publish real names of people; turn them into roles in `public/data/roles.json`.
- Firestore rules are changed only in collective-bucket/firestore.
