# 🌶 Royal Rajasthan Spice Market — Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Docker | Latest | [docker.com](https://docker.com) |
| Supabase CLI | Latest | `npm install -g supabase` |

---

## Step 1 — Clone and Install

```bash
git clone <your-repo-url> royal-rajasthan-spices
cd royal-rajasthan-spices
pnpm install
```

---

## Step 2 — Start Local Services

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Services started:
| Service | URL | Purpose |
|---------|-----|---------|
| Meilisearch | http://localhost:7700 | Product search |
| Umami Analytics | http://localhost:3010 | Privacy-first analytics |
| GlitchTip | http://localhost:3011 | Error monitoring |
| Redis | localhost:6379 | Caching (optional) |

---

## Step 3 — Supabase Setup

### Option A: Local (recommended for dev)

```bash
supabase start          # Starts local Supabase
supabase db push        # Applies all 10 migrations
pnpm --filter @rrs/database seed   # Seeds 8 products + categories
```

Local Supabase URLs (from `supabase start` output):
- Studio: http://localhost:54323
- API: http://localhost:54321
- DB: postgresql://postgres:postgres@localhost:54322/postgres

### Option B: Hosted (production)

1. Create project at [supabase.com](https://supabase.com)
2. Get URL and keys from Project Settings → API
3. Run migrations:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

---

## Step 4 — Environment Variables

```bash
cp apps/customer-web/.env.example apps/customer-web/.env.local
cp apps/admin-panel/.env.example apps/admin-panel/.env.local
```

**Minimum required to start** (just COD, no search, no email):

```env
# In BOTH .env.local files:
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
NEXT_PUBLIC_APP_URL=http://localhost:3000
PAYMENT_PROVIDER=cod
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey_dev_royal_rajasthan
```

For full features, fill in all variables from `.env.example`.

---

## Step 5 — Create First Admin User

1. Start the app (Step 6 below)
2. Register at http://localhost:3000/register
3. Promote to admin in Supabase Studio:

```sql
-- Run in Supabase SQL editor
INSERT INTO public.user_roles (user_id, role_id)
SELECT 
  '<your-user-uuid>',
  r.id
FROM public.roles r
WHERE r.name = 'super_admin';
```

---

## Step 6 — Run Development Servers

```bash
pnpm dev
```

| App | URL |
|-----|-----|
| Customer Web | http://localhost:3000 |
| Admin Panel | http://localhost:3001 |

---

## Step 7 — Sync Meilisearch Index

After seeding products, sync them to Meilisearch:

```bash
curl -X POST http://localhost:3001/api/products/sync \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Step 8 — Run Tests

```bash
# Unit tests
pnpm --filter @rrs/shared test

# Customer web unit tests
pnpm --filter @rrs/customer-web test

# E2E tests (requires running dev server)
pnpm --filter @rrs/customer-web exec playwright test
```

---

## Production Deployment

### Vercel (Recommended)

1. Push repo to GitHub
2. Create Vercel project → Import repo
3. **Customer Web**: Set root directory to `apps/customer-web`
4. **Admin Panel**: Create second Vercel project, root `apps/admin-panel`
5. Add all production env vars in Vercel dashboard
6. GitHub Actions auto-deploys on push to `main`

Required GitHub Secrets:
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_CUSTOMER_PROJECT_ID
VERCEL_ADMIN_PROJECT_ID
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
SUPABASE_DB_PASSWORD
REVALIDATE_TOKEN
```

### Docker (Self-hosted VPS)

```bash
# Build images
docker build -f docker/Dockerfile.customer \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -t rrs-customer .

docker build -f docker/Dockerfile.admin \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -t rrs-admin .

# Run
docker run -p 3000:3000 --env-file apps/customer-web/.env rrs-customer
docker run -p 3001:3001 --env-file apps/admin-panel/.env rrs-admin
```

---

## Payment Setup

### Razorpay (India — Recommended)
1. Create account at [razorpay.com](https://razorpay.com)
2. Get API keys from Settings → API Keys
3. Set up webhook: `https://shop.yourdomain.com/api/webhooks/razorpay`
4. Set `PAYMENT_PROVIDER=razorpay` and add keys to env

### Stripe (International)
1. Create account at [stripe.com](https://stripe.com)
2. Get keys from Dashboard → Developers → API Keys
3. Set up webhook: `https://shop.yourdomain.com/api/webhooks/stripe`
4. Set `PAYMENT_PROVIDER=stripe` and add keys to env

### Cash on Delivery (Always available)
Set `PAYMENT_PROVIDER=cod` — no additional configuration needed.

**Payment abstraction** — switch between providers by changing one env var. All providers implement the same `IPaymentProvider` interface.

---

## Meilisearch Setup (Production)

### Self-hosted (Recommended)

```bash
# Using Docker
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -v $(pwd)/meili_data:/meili_data \
  -e MEILI_MASTER_KEY=your-secure-master-key \
  -e MEILI_ENV=production \
  getmeili/meilisearch:v1.10
```

Then point `MEILISEARCH_HOST` to your server URL.

### Cloud (Meilisearch Cloud)
Create instance at [cloud.meilisearch.com](https://cloud.meilisearch.com) — free tier available.

---

## GST & India-specific Setup

Spices are classified under HSN code **0910** and attract **5% GST**.

```env
GST_NUMBER=27XXXXX1234Z1   # Your GST registration number
GST_RATE_PERCENT=5          # 5% for spices
```

GST invoices are auto-generated as PDFs on order delivery using `@react-pdf/renderer` and stored in Supabase Storage under the `invoices` bucket.

For interstate orders: IGST = 5%
For intrastate orders: CGST (2.5%) + SGST (2.5%) = 5% total

---

## Shipping Integration

### Shiprocket
1. Register at [shiprocket.in](https://shiprocket.in)
2. Add credentials to env:
   ```env
   SHIPPING_PROVIDER=shiprocket
   SHIPROCKET_EMAIL=your@email.com
   SHIPROCKET_PASSWORD=your-password
   ```

### Manual / COD Delivery
Set `SHIPPING_PROVIDER=manual` — shipping label generation is skipped. Works fully for COD and local delivery.

---

## Troubleshooting

**Build fails with "Cannot find module @rrs/*"**
→ Run `pnpm install` from the repo root, not inside apps/

**Supabase RLS blocking queries**  
→ Ensure `anon` role has `SELECT` on public tables. Check `supabase/migrations/007_rls_policies.sql`

**Meilisearch returns no results**
→ Run the sync: `POST /api/products/sync` from admin panel

**Images not loading**
→ Add your Supabase URL to `next.config.ts` `images.remotePatterns`

**Cart session not persisting**
→ Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
