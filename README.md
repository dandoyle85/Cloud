# PowerHouse Phase 2.2 — Keyword Explorer (Sexy UI)
Date: 2025-09-30T00:31:04.826603Z

## Files
- public/keywords.html       – new page
- public/assets/styles.css    – dark grey + burnt orange theme
- public/assets/keywords.js   – fetch, render, CSV export, copy ChatGPT prompt
- functions/api/keywords/[id].js – PATCH a single keyword (e.g., save chosen title)

## How to deploy
1) Drop `public/` and `functions/` into your repo (keep existing files).
2) Commit → Cloudflare redeploys.
3) Visit `/keywords.html`.

## Notes
- Uses existing `/api/keywords` endpoint (GET/POST already in your project).
- PATCH endpoint added: `/api/keywords/:id` to update JSON fields like `titles`.
- No paid APIs. Seed expansion happens server-side (autocomplete + Reddit) you already enabled.

