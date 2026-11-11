# AGENTS

- "yayınla" = `npm run check && npm run stamp && npm run deploy` from the repo root (hosting only). `firebase` is the local devDependency; use npm scripts or `npx firebase`.
- Every new `data-i18n` key needs a Turkish string in `public/assets/i18n.js`; `npm run check` fails on missing or unused keys.
- Data JSON text fields are `{ en, tr }`.
- Never publish real names of people; turn them into roles in `public/data/roles.json`.
- Firestore rules are changed only in collective-bucket/firestore.
- `apps/daireler` is the test site (hosting target `test`, site `cbucket-yildirimlar-test`, test.yildirimlar.co); CI deploys it on push to `main` (manual: `npm run deploy:test`). Listings live in `apps/daireler/data/daireler.json`.
