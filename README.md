# PowerHouse MVP - Phase 1.6

## New Features
- Niche buttons are compact (fit text, not full width)
- Keyword fallback prompt now requires 10 blog-worthy keyword expansions (AdSense-ready)
- Each keyword includes blog titles, YouTube Shorts hooks, Pinterest pin ideas
- Mobile-friendly layout and prompt textarea with copy button

## Deploy
1. Push repo to GitHub.
2. In Cloudflare Pages, connect the repo.
3. Build command: leave blank
4. Output dir: public
5. Deploy. Cloudflare will serve:
   - / → dashboard
   - /api/niches → niches API
   - /api/keywords → keywords API (new AdSense blog expansion prompt)
   - /api/offers → affiliate offers API
   - /api/chatgpt → AI fallback API
