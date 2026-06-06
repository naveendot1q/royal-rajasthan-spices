-- Banners
CREATE TABLE IF NOT EXISTS public.banners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  subtitle         TEXT,
  image_url        TEXT NOT NULL,
  mobile_image_url TEXT,
  link             TEXT,
  cta_text         TEXT,
  position         TEXT NOT NULL DEFAULT 'hero'
                   CHECK (position IN ('hero','mid_page','sidebar','popup')),
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at        TIMESTAMPTZ,
  ends_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CMS Pages
CREATE TABLE IF NOT EXISTS public.cms_pages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       TEXT UNIQUE NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  meta       JSONB NOT NULL DEFAULT '{}',
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Blogs
CREATE TABLE IF NOT EXISTS public.blogs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  body         TEXT,
  cover_image  TEXT,
  author_id    UUID REFERENCES auth.users(id),
  tags         TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  seo          JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blogs_published ON public.blogs(published_at DESC)
  WHERE published_at IS NOT NULL;
CREATE INDEX idx_blogs_slug ON public.blogs(slug);

CREATE TRIGGER set_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value      JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipping Methods
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  provider         TEXT NOT NULL DEFAULT 'manual',
  base_price       DECIMAL(10,2) NOT NULL DEFAULT 0,
  free_above       DECIMAL(10,2),
  estimated_days   INTEGER,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order       INTEGER NOT NULL DEFAULT 0
);

-- Insert default settings
INSERT INTO public.system_settings (key, value, description) VALUES
  ('store_name', '"Royal Rajasthan Spice Market"', 'Display name of the store'),
  ('store_currency', '"INR"', 'Default store currency'),
  ('gst_rate', '5', 'GST percentage for spices'),
  ('free_shipping_above', '499', 'Free shipping threshold in INR'),
  ('max_cart_quantity', '50', 'Max quantity per cart item'),
  ('reviews_require_purchase', 'true', 'Require verified purchase for reviews')
ON CONFLICT (key) DO NOTHING;

-- Insert default shipping methods
INSERT INTO public.shipping_methods (name, description, provider, base_price, free_above, estimated_days) VALUES
  ('Standard Delivery', '5-7 business days', 'shiprocket', 60, 499, 7),
  ('Express Delivery', '2-3 business days', 'shiprocket', 120, 999, 3),
  ('Same Day Delivery', 'Order before 2 PM', 'manual', 200, NULL, 1)
ON CONFLICT DO NOTHING;
