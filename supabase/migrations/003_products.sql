-- Product Categories (nested, self-referencing)
CREATE TABLE IF NOT EXISTS public.product_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  meta        JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);

CREATE INDEX idx_categories_parent ON public.product_categories(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_categories_slug ON public.product_categories(slug);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID NOT NULL REFERENCES public.product_categories(id),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  description       TEXT,
  sku               TEXT UNIQUE,
  base_price        DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  compare_price     DECIMAL(10,2) CHECK (compare_price >= 0),
  cost_price        DECIMAL(10,2) CHECK (cost_price >= 0),
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','active','archived')),
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  origin            TEXT,
  weight_grams      INTEGER,
  nutritional_info  JSONB NOT NULL DEFAULT '{}',
  meta              JSONB NOT NULL DEFAULT '{}',
  search_vector     TSVECTOR,
  sales_count       INTEGER NOT NULL DEFAULT 0,
  avg_rating        DECIMAL(3,2) NOT NULL DEFAULT 0,
  review_count      INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_products_search_gin    ON public.products USING GIN(search_vector);
CREATE INDEX idx_products_tags_gin      ON public.products USING GIN(tags);
CREATE INDEX idx_products_category      ON public.products(category_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_slug          ON public.products(slug);
CREATE INDEX idx_products_featured      ON public.products(is_featured, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_sales         ON public.products(sales_count DESC) WHERE status = 'active';

-- Auto update search vector
CREATE OR REPLACE FUNCTION public.products_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.origin, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.products_search_vector_update();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Product Images
CREATE TABLE IF NOT EXISTS public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id, sort_order);

-- Product Variants (250g, 500g, 1kg etc.)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  sku            TEXT UNIQUE,
  price_modifier DECIMAL(10,2) NOT NULL DEFAULT 0,
  weight_grams   INTEGER,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_variants_product ON public.product_variants(product_id) WHERE is_active = TRUE;

-- Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id          UUID UNIQUE NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  warehouse_id        UUID,
  quantity            INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_qty        INTEGER NOT NULL DEFAULT 0 CHECK (reserved_qty >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_variant ON public.inventory(variant_id);
CREATE INDEX idx_inventory_low_stock ON public.inventory(quantity, low_stock_threshold)
  WHERE quantity <= low_stock_threshold;

-- Inventory Logs
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id   UUID NOT NULL REFERENCES public.product_variants(id),
  delta        INTEGER NOT NULL,
  reason       TEXT NOT NULL,
  reference_id UUID,
  actor_id     UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_logs_variant ON public.inventory_logs(variant_id, created_at DESC);
