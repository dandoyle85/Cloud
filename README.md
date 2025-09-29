# PowerHouse — Phase 2.1.0 (WordPress + Auto Mode Skeleton)

## New
- WordPress Integration tab (save multiple WP sites with status / export mode / AI scaling)
- Auto Mode states displayed on Dashboard
- LocalStorage used as mock DB for quick testing
- APIs: /api/niches, /api/keywords?seed=..., /api/offers, /api/wp-publish (echo stub)
- Worker skeleton for future CRON auto-posting

## Deploy (Cloudflare Pages)
- Build command: (leave blank)
- Output dir: `public`

## Next (Phase 2.1.1)
- Swap localStorage → Supabase or Cloudflare D1 (real persistence)
- Implement `/api/wp-publish` to POST to WP REST API with saved site creds
- Add a Cloudflare Worker with CRON to honor Auto Mode + AI scaling schedules
