// Hidden, ungated copies of the investor deck — one slug per recipient.
//
// Each slug is served at https://polytecks.com/d/<slug>. All slugs show the
// same deck (synced from ../webdeck by `npm run sync-deck`).
//
//   Add a recipient:  add a line below, commit, push. No re-sync needed.
//   Retire a slug:    delete its line, commit, push. The URL then 404s.
//
// Slugs: lowercase letters, digits and hyphens only. Add a random suffix so
// they can't be guessed. Never link these from the site or list them anywhere.
export const DECK_SLUGS = [
  "samsung-k7q2",
  "general-2hgj",
];
