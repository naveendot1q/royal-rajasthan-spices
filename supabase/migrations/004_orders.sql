-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         TEXT UNIQUE NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('percentage','fixed','free_shipping')),
  value        DECIMAL(10,2) NOT NULL CHECK (value > 0),
  min_order    DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount DECIMAL(10,2),
  max_uses     INTEGER,
  used_count   INTEGER NOT NULL DEFAULT 0,
  user_limit   INTEGER NOT NULL DEFAULT 1,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at    TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code ON public.coupons(code) WHERE is_active = TRUE;

-- Carts (guest + authenticated)
CREATE TABLE IF NOT EXISTS public.carts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_carts_user    ON public.carts(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_carts_session ON public.carts(session_id) WHERE session_id IS NOT NULL;

-- Cart Items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id         UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  variant_id      UUID NOT NULL REFERENCES public.product_variants(id),
  quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_snapshot  DECIMAL(10,2) NOT NULL,
  saved_for_later BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cart_id, variant_id, saved_for_later)
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT UNIQUE NOT NULL,
  user_id          UUID REFERENCES auth.users(id),
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN (
                     'pending','confirmed','packed','shipped',
                     'out_for_delivery','delivered',
                     'cancelled','returned','refunded'
                   )),
  subtotal         DECIMAL(10,2) NOT NULL,
  discount_amount  DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_fee     DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  total            DECIMAL(10,2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'INR',
  payment_method   TEXT CHECK (payment_method IN ('razorpay','stripe','cod')),
  coupon_id        UUID REFERENCES public.coupons(id),
  address_snapshot JSONB NOT NULL,
  notes            TEXT,
  gst_invoice_url  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_status    ON public.orders(user_id, status, created_at DESC);
CREATE INDEX idx_orders_number         ON public.orders(order_number);
CREATE INDEX idx_orders_status_created ON public.orders(status, created_at DESC);

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Order Number Generator
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RRS-' || to_char(now(), 'YYYYMMDD') || '-' ||
         LPAD(nextval('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Order Items
CREATE TABLE IF NOT EXISTS public.order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id     UUID REFERENCES public.product_variants(id),
  name_snapshot  TEXT NOT NULL,
  image_snapshot TEXT,
  sku_snapshot   TEXT,
  price          DECIMAL(10,2) NOT NULL,
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  fulfilled_qty  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES public.orders(id),
  provider            TEXT NOT NULL CHECK (provider IN ('razorpay','stripe','cod')),
  provider_order_id   TEXT,
  provider_payment_id TEXT,
  amount              DECIMAL(10,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','captured','failed','refunded')),
  captured_at         TIMESTAMPTZ,
  metadata            JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_order ON public.payments(order_id);

-- Refunds
CREATE TABLE IF NOT EXISTS public.refunds (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id         UUID NOT NULL REFERENCES public.payments(id),
  amount             DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  reason             TEXT,
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processed','failed')),
  provider_refund_id TEXT,
  processed_at       TIMESTAMPTZ,
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tracking Updates
CREATE TABLE IF NOT EXISTS public.tracking_updates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  location    TEXT,
  description TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by  UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_tracking_order ON public.tracking_updates(order_id, occurred_at DESC);
