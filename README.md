# PowerHouse MVP - Phase 1.7

## New Features
- Hot Niches now pull from multiple live sources (Google Trends, Reddit, YouTube, Amazon, Udemy, Wikipedia)
- Evergreen niches refresh dynamically (no hard-coded staleness)
- Manual "Add Niche" box lets you inject your own ideas
- Refresh button + timestamp so you know when niches last updated
- Fallback always ensures at least a list of niches is returned

## Deploy
1. Push repo to GitHub.
2. In Cloudflare Pages, connect the repo.
3. Build command: leave blank
4. Output dir: public
5. Deploy. Cloudflare will serve:
   - / → dashboard
   - /api/niches → niches API (multi-source + fallback)
   - /api/keywords → keywords API (AdSense blog expansion prompt)
   - /api/offers → affiliate offers API
   - /api/chatgpt → AI fallback API
