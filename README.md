# 🌶 Royal Rajasthan Spice Market

Production-grade multi-tenant ecommerce platform for selling authentic Rajasthani spices online.

**Customer Web** → `shop.royalrajasthanspices.com`  
**Admin Panel** → `admin.royalrajasthanspices.com`

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Styling | Tailwind CSS + Rajasthan design system |
| Search | Meilisearch (self-hosted) |
| Cache | Upstash Redis |
| Email | Resend + React Email |
| Payments | Razorpay / Stripe / COD (abstraction layer) |
| Shipping | Shiprocket / Delhivery (abstraction layer) |
| Jobs | Trigger.dev |
| Monitoring | GlitchTip + Vercel Analytics |
| Analytics | Umami |
| Deployment | Vercel (both apps) |
| CI/CD | GitHub Actions |

---

## Quick Start

### Prerequisites
- Node.js 20+, pnpm 9+, Docker

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd royal-rajasthan-spices
pnpm install
```

### 2. Start Local Services (Meilisearch, Umami, GlitchTip)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Set Up Supabase
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Seed demo data
pnpm --filter database seed
```

### 4. Configure Environment Variables
```bash
cp apps/customer-web/.env.example apps/customer-web/.env.local
cp apps/admin-panel/.env.example apps/admin-panel/.env.local
# Fill in your values
```

### 5. Run Development Servers
```bash
pnpm dev
# Customer web → http://localhost:3000
# Admin panel  → http://localhost:3001
# Meilisearch  → http://localhost:7700
# Supabase     → http://localhost:54323
```

---

## Environment Variables

See `apps/customer-web/.env.example` for all required variables.

Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never expose to client
- `PAYMENT_PROVIDER` — `razorpay` | `stripe` | `cod`
- `SMS_ENABLED` — `false` by default, entire app works without SMS
- `MEILISEARCH_HOST` — your Meilisearch instance URL

---

## Project Structure

```
royal-rajasthan-spices/
├── apps/
│   ├── customer-web/     # Next.js shop (port 3000)
│   └── admin-panel/      # Next.js admin (port 3001)
├── packages/
│   ├── ui/               # Shared components
│   ├── database/         # Supabase client + migrations
│   ├── types/            # TypeScript types
│   ├── shared/           # Utils, formatters, constants
│   ├── search/           # Meilisearch client
│   ├── email/            # Email templates
│   └── notifications/    # Email + SMS abstraction
├── supabase/             # DB config + migrations
├── docker/               # Dockerfiles
└── .github/workflows/    # CI/CD pipelines
```

---

## Features

### Customer Website
- Rajasthan-themed hero, category grid, product carousels
- Product listing with infinite scroll, filters, sort
- Product detail with image gallery, zoom, variants, reviews
- Cart with save-for-later, coupon support, shipping estimate
- Checkout: guest + authenticated, multiple payment methods
- Amazon-style order tracking with 8-state timeline
- Meilisearch instant autocomplete
- Wishlist, recently viewed
- User account: profile, addresses, orders, reviews, support
- PWA installable, Hindi + English i18n ready
- GST invoices for Indian orders
- Full SEO: metadata, OG, JSON-LD structured data

### Admin Panel
- Dashboard: KPI cards, revenue area chart, recent orders
- Product CRUD with image upload, variants, inventory
- Order management with status updates and tracking
- Inventory: stock levels, low-stock alerts, manual adjustments
- Review moderation: approve/reject/feature
- Coupon management with usage analytics
- Settings: store config, tax, shipping
- Role-based access: super_admin, admin, staff

---

## Database

24 PostgreSQL tables with full RLS, soft delete, indexes, triggers:
`profiles` · `roles` · `user_roles` · `addresses` · `product_categories` · `products` · `product_images` · `product_variants` · `inventory` · `inventory_logs` · `carts` · `cart_items` · `orders` · `order_items` · `payments` · `refunds` · `tracking_updates` · `coupons` · `reviews` · `wishlists` · `support_tickets` · `support_messages` · `notifications` · `audit_logs` · `banners` · `cms_pages` · `blogs` · `system_settings` · `shipping_methods`

---

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Create two Vercel projects (customer-web + admin-panel)
3. Set root directory for each project in Vercel settings
4. Add environment variables
5. GitHub Actions auto-deploys on push to `main`

### Docker (Self-hosted)
```bash
docker build -f docker/Dockerfile.customer -t rrs-customer .
docker build -f docker/Dockerfile.admin -t rrs-admin .
```

---

## Security
- Supabase RLS on all 24 tables
- RBAC with role-based permission guards
- Rate limiting via Upstash Redis
- Input validation with Zod on all server actions
- Payment webhook signature verification (Razorpay HMAC, Stripe)
- Secure HTTP headers (X-Frame-Options, CSP, HSTS)
- Audit logging for all admin operations
- Service role key never exposed to client

---

Built with ❤️ and 🌶 for authentic Rajasthani flavors.
