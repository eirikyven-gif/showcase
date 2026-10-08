# Vibe static hub

This is the initial public directory at `/vibe/`, built with plain HTML, CSS and browser JavaScript. No framework, build step, account, server-side storage or third-party runtime is required.

## Catalog contract

`catalog.json` is an incremental catalog of reviewed static demos. Add an entry only after the app has been assessed for its purpose, dependencies, data handling, and privacy. Each entry should provide:

```json
{
  "slug": "unique-url-segment",
  "name": "App name",
  "useCase": "What someone can use it for",
  "category": "Category",
  "audience": ["Audience"]
}
```

The hub creates cards from that JSON and searches all four content fields. Search is case- and accent-insensitive. Do not add entries without assessment evidence.

## Routes

- `/vibe/` serves the hub.
- Card links are rooted at `/vibe/[slug]/` for reviewed static demo routes.
- `404.html` handles unknown paths on static hosts that support directory-level 404 pages and includes a link back to `/vibe/`. Host behavior for custom 404 documents varies; verify it when selecting the public host. Individual reviewed static demo routes are current work and are added incrementally.

## Local preview

From the repository root, run `python3 -m http.server 8000` and visit `http://localhost:8000/vibe/`. Fetch-based catalog loading needs an HTTP server; opening the HTML as a `file:` URL is not supported.
