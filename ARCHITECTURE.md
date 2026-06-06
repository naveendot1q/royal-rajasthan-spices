# Architecture Guide — Royal Rajasthan Spice Market

## System Overview

```
                        ┌─────────────────────────────────────────┐
                        │           VERCEL EDGE NETWORK           │
                        │                                         │
      Customer   ──────►│  apps/customer-web   (port 3000)        │
      Browser           │  Next.js 15 App Router + RSC            │
                        │  ISR • Edge Functions • Middleware       │
                        │                                         │
      Admin     ──────►│  apps/admin-panel    (port 3001)         │
      Browser           │  Next.js 15 App Router + SSR            │
                        └────────────┬──────────────┬────────────┘
                                     │              │
                         ┌───────────┘              └──────────┐
                         ▼                                      ▼
              ┌──────────────────┐              ┌──────────────────────┐
              │  SUPABASE CLOUD  │              │  EXTERNAL SERVICES   │
              │                  │              │                      │
              │  PostgreSQL DB   │              │  Razorpay / Stripe   │
              │  Supabase Auth   │              │  Resend (email)      │
              │  Supabase Storage│              │  Meilisearch         │
              │  Supabase Realtime│             │  Upstash Redis       │
              │  RLS Policies    │              │  Trigger.dev         │
              └──────────────────┘              └──────────────────────┘
```

## Monorepo Structure

```
royal-rajasthan-spices/
├── apps/
│   ├── customer-web/        Next.js 15 shop
│   └── admin-panel/         Next.js 15 admin
│
├── packages/
│   ├── ui/                  Design tokens + shared components
│   ├── database/            Supabase typed client + migrations
│   ├── types/               Shared TypeScript interfaces
│   ├── shared/              Utils, formatters, validators, constants
│   ├── config/              Tailwind, TypeScript, ESLint base configs
│   ├── email/               Transactional email HTML templates
│   ├── search/              Meilisearch client + sync utilities
│   └── notifications/       Email + SMS abstraction layer
│
├── supabase/
│   ├── migrations/          10 SQL migration files (run in order)
│   └── functions/           Edge Functions (low-stock alert)
│
├── docker/                  Multi-stage Dockerfiles
├── .github/workflows/       CI + Deploy + Backup pipelines
└── docker-compose.dev.yml   Local: Meilisearch, Umami, GlitchTip
```

## Request Lifecycle

### Server-Side (RSC / Server Actions)

```
Browser Request
    │
    ▼
Vercel Edge (Middleware)
    │  - Auth session validation
    │  - Redirect unauthenticated to /login
    │  - Set rate limit headers
    ▼
Next.js App Router
    │  - Route matching
    │  - Layout tree rendering
    ▼
React Server Component
    │  - createSupabaseServer() with cookie-based session
    │  - Direct DB query via Supabase client (RLS enforced)
    │  - Data passed as props to Client Components
    ▼
Client Component (if needed)
    │  - Hydration
    │  - Client-side state (cart count, wishlist)
    │  - TanStack Query for real-time mutations
    ▼
Server Action (on mutation)
    │  - Zod validation
    │  - Supabase operation
    │  - revalidatePath() for ISR invalidation
```

### Caching Strategy

```
Static                 ISR (1h)              SSR (per-request)
──────                 ────────              ──────────────────
/                      /products             /account/*
/blog                  /products/[slug]      /cart
/categories            /categories/[slug]    /checkout
/blog/[slug]           /search               /orders/[id]
sitemap.xml
robots.txt
```

## Database Schema

### Entity Relationships

```
auth.users (Supabase managed)
    │
    ├── profiles (1:1)
    ├── user_roles (M:M) ── roles
    ├── addresses (1:M)
    ├── carts (1:1) ── cart_items ── product_variants
    ├── orders (1:M)
    │       ├── order_items ── product_variants
    │       ├── payments
    │       ├── refunds
    │       └── tracking_updates
    ├── reviews ── products
    ├── wishlists ── product_variants
    ├── support_tickets (1:M)
    │       └── support_messages
    └── notifications

products
    ├── product_categories (M:1, self-referencing for nesting)
    ├── product_images (1:M)
    └── product_variants (1:M)
            └── inventory (1:1)
            └── inventory_logs (1:M)

banners, cms_pages, blogs, system_settings, shipping_methods, audit_logs
```

### RLS Policy Matrix

| Table | Public Read | Auth Read | Own Write | Staff Write |
|-------|------------|-----------|-----------|-------------|
| products | active only | ✓ | ✗ | ✓ |
| orders | ✗ | own only | own only | ✓ |
| reviews | approved only | own | own | ✓ |
| profiles | ✗ | own | own | ✓ |
| carts | ✗ | own | own | ✓ |
| inventory | ✓ | ✓ | ✗ | ✓ |
| audit_logs | ✗ | ✗ | insert | super_admin |

## Payment Architecture

```typescript
// Abstraction layer — swap providers via PAYMENT_PROVIDER env var
interface IPaymentProvider {
  createOrder(amount: number, orderId: string): Promise<PaymentOrder>
  capturePayment(capture: PaymentCapture): Promise<boolean>
  refund(paymentId: string, amount: number): Promise<RefundResult>
  verifyWebhook(payload: string, signature: string): boolean
}

// Providers:    RazorpayProvider | StripeProvider | CodProvider
// Selection:    getPaymentProvider() → reads PAYMENT_PROVIDER env
// COD fallback: CodProvider always available, no 3rd party deps
```

### Payment Flow (Razorpay)

```
1. Customer clicks "Place Order"
2. Server Action: createOrder() → inserts order + payment (status: pending)
3. Server Action returns: { paymentOrderId, amount }
4. Client opens Razorpay checkout widget
5. Customer completes payment
6. Client calls: POST /api/payments/verify-razorpay
7. Server verifies HMAC signature
8. Server updates: payment.status=captured, order.status=confirmed
9. Supabase trigger fires: reserve_inventory_on_order()
10. Email sent via Resend
11. Client redirects to /orders/[orderNumber]
```

### Payment Flow (COD)

```
1. Customer places order
2. Server Action: createOrder() → order.status=confirmed immediately
3. Cart cleared, confirmation email sent
4. No payment gateway involved
```

## Search Architecture (Meilisearch)

```
Admin saves product
    │
    ▼
POST /api/products/sync { productId }
    │
    ▼
Fetch product from Supabase (with joins)
    │
    ▼
Transform to SearchProduct shape:
  { id, name, slug, description, base_price, avg_rating,
    sales_count, is_featured, tags, origin,
    category_id, category_name, primary_image,
    has_stock, price_range }
    │
    ▼
indexProducts() → Meilisearch upsert
    │
    ▼
Custom ranking: [words, typo, proximity,
                attribute, sort, exactness,
                sales_count:desc]  ← bestsellers rank higher

Customer types in search bar
    │
    ▼
Debounced (250ms) GET /api/search/autocomplete?q=...
    │
    ▼
Meilisearch index.search(q, { limit: 6 })
    │
    ▼
Returns: hits with highlighted snippets
    │
    ▼
Dropdown shows results with images + prices
```

## ISR Invalidation

When an admin saves/updates a product, the customer-facing pages are immediately updated:

```typescript
// After product save in admin
await fetch(`${NEXT_PUBLIC_APP_URL}/api/revalidate`, {
  method: "POST",
  headers: { "x-revalidate-token": REVALIDATE_TOKEN },
  body: JSON.stringify({
    path: `/products/${slug}`,
    tag: "products",
  }),
});
```

This calls Next.js `revalidatePath()` and `revalidateTag()` to purge the ISR cache. Product listing pages (`/products`) are revalidated hourly via `export const revalidate = 3600`.

## Shipping Architecture

```typescript
// Same adapter pattern as payments
interface IShippingProvider {
  createShipment(order: Order): Promise<Shipment>
  trackOrder(trackingNumber: string): Promise<TrackingUpdate[]>
  cancelShipment(trackingNumber: string): Promise<boolean>
  getLabel(trackingNumber: string): Promise<string> // PDF URL
  getRates(from, to, weightGrams): Promise<ShippingRate[]>
}

// SHIPPING_PROVIDER env var: shiprocket | delhivery | manual
```

## Security Layers

```
Layer 1: Network
  └── Vercel WAF, DDoS protection, SSL/TLS

Layer 2: Application (Next.js Middleware)
  └── Session validation on every request
  └── Auth redirects (/account, /checkout, /admin)
  └── Rate limiting via Upstash Redis

Layer 3: Server Actions
  └── Zod input validation (all forms)
  └── Supabase auth check (getUser())
  └── CSRF protection (built into Next.js Server Actions)

Layer 4: Database (Supabase RLS)
  └── Every table has RLS enabled
  └── Users can only read/write own data
  └── Staff role checked via JOIN to user_roles
  └── Audit log for all admin mutations

Layer 5: External APIs
  └── Payment webhook signature verification (HMAC)
  └── Service role key never in client bundle
  └── Revalidation endpoint protected by secret token
```

## Notification Flow

```
Order Event (status change)
    │
    ▼
Server Action or Webhook Handler
    │
    ├──► sendEmail() via Resend          [always]
    │      - Order confirmation HTML
    │      - Shipped with tracking number
    │      - Delivered + review request
    │      - Cancellation notice
    │
    ├──► sendSMS() via Twilio            [if SMS_ENABLED=true]
    │      - Order confirmed SMS
    │      - Shipped SMS with link
    │
    └──► Supabase notifications table    [in-app]
           - Realtime push to open browser tabs
           - Unread badge on account icon
```

## Performance Optimizations

| Technique | Applied To | Impact |
|-----------|-----------|--------|
| ISR (1h) | Product listing, homepage | Near-zero DB load for reads |
| On-demand ISR | Product detail | Instant invalidation on admin save |
| React Suspense | Heavy components | Progressive loading |
| Next/Image | All product images | AVIF/WebP, lazy load, srcset |
| Meilisearch | Search | <50ms response, typo tolerance |
| Upstash Redis | Rate limiting, session data | O(1) lookups |
| GIN index | Product search_vector | Fast full-text search in Postgres |
| Partial pre-rendering | Homepage sections | Streams static shell, defers dynamic |
| Turbopack (dev) | Local development | <1s HMR |

## Scaling Considerations

This architecture handles 1M customers and 100K orders/day on free tiers during development. For production scale:

| Component | Current | Scale-Up Path |
|-----------|---------|---------------|
| Supabase DB | Free (500MB) | Pro ($25/mo, 8GB) → Enterprise |
| Vercel | Hobby | Pro ($20/mo) → Enterprise |
| Upstash Redis | Free (10k/day) | Pay-as-you-go |
| Meilisearch | Self-hosted | Meilisearch Cloud |
| Resend | Free (3k/mo) | $20/mo = 50k emails |
| Supabase Storage | 1GB free | Pay-as-you-go |
