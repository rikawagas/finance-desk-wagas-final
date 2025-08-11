
# Finance Desk – Wagas Ukuleles

Clean, spaced, white-background finance dashboard with Supabase:
- Add, **edit**, **delete** transactions
- Track **monthly goal** + progress bar
- **Factory price** per sale → supplier payable totals
- **Per-store** breakdown (Shopee, Lazada, TikTok Shop, Etsy, Shopify Local, Shopify International)
- **PHP & USD** with adjustable USD→PHP conversion in Settings

## 1) Create DB in Supabase

Run this SQL in the Supabase SQL Editor (project → SQL editor). It creates tables with permissive RLS to get you running fast.

See `supabase.sql` in this repo.

## 2) Environment variables

Create a `.env` file for local dev (Vite):
```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

On **Vercel**, add the same two as Environment Variables (Project Settings → Environment Variables).

## 3) Install & run locally

```
npm i
npm run dev
```

## 4) Deploy to Vercel

1. Push this folder to a **GitHub** repo.
2. In Vercel, **New Project** → Import your repo.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add env vars from step 2. Deploy.

## Notes

- Edit/delete are in the **Transactions** table rows (Edit modal + Delete button).
- Monthly goal & conversion rate are stored in `settings` (single row with id=1).
- Totals show both PHP and USD. Conversion uses `settings.usd_to_php`.
