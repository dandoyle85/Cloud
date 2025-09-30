# PowerHouse Auto Publisher Worker

This Worker runs on a CRON schedule (free in Cloudflare Workers).

## Files
- `auto-publisher.js` → Worker code
- `wrangler.toml` → Config (runs every hour)

## Deploy
1. Install wrangler:
   npm install -g wrangler

2. Deploy:
   wrangler deploy

Cloudflare will now execute the Worker every hour. For now it logs "Would publish" messages.
