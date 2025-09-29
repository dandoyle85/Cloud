# PowerHouse MVP - Phase 1.5

## New Features
- Clickable niches: auto-fill and run keyword + offers on click
- Prompt shows in formatted textarea with copy-to-clipboard
- Mobile-friendly styles for textarea + UI

## Deploy
1. Push repo to GitHub.
2. In Cloudflare Pages, connect the repo.
3. Build command: leave blank
4. Output dir: public
5. Deploy. Cloudflare will serve:
   - / → dashboard
   - /api/niches → niches API
   - /api/keywords → keywords API
   - /api/offers → affiliate offers API
   - /api/chatgpt → AI fallback API
