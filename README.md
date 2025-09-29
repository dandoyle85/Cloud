# PowerHouse MVP - Phase 1

## Structure
- public/ → frontend (dashboard HTML/CSS/JS)
- functions/api/ → Cloudflare Pages Functions (backend APIs)

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
