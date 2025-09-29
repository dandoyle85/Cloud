# PowerHouse Phase 2.1.1 Functions

This package contains Cloudflare Pages Functions for connecting your Dashboard to Supabase.

## Files
- functions/api/sites.js      → GET all sites, POST new site
- functions/api/sites/[id].js → PATCH update site, DELETE remove site

## Usage
1. Place these files into your repo in the exact folder structure shown.
2. Push to GitHub → Cloudflare Pages will redeploy.
3. Test:
   - GET https://YOUR-PAGES-URL/api/sites → should return []
   - POST with site JSON → inserts row into Supabase
   - PATCH/DELETE by id → update or remove

Make sure environment variables are set in Cloudflare Pages Settings:
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- ENC_SECRET (for future encryption)
