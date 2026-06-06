export type ProductStatus = "draft" | "active" | "archived";

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  meta: Record<string, unknown>;
  created_at: string;
  deleted_at: string | null;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku: string | null;
  price_modifier: number;
  weight_grams: number | null;
  is_active: boolean;
  sort_order: number;
  inventory?: Inventory;
}

export interface Inventory {
  id: string;
  variant_id: string;
  quantity: number;
  reserved_qty: number;
  low_stock_threshold: number;
  available: number; // computed: quantity - reserved_qty
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  base_price: number;
  compare_price: number | null;
  cost_price: number | null;
  status: ProductStatus;
  is_featured: boolean;
  tags: string[];
  origin: string | null;
  weight_grams: number | null;
  nutritional_info: Record<string, string>;
  meta: Record<string, unknown>;
  sales_count: number;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_price: number | null;
  avg_rating: number;
  review_count: number;
  sales_count: number;
  is_featured: boolean;
  primary_image?: string;
  category_name?: string;
  has_stock: boolean;
}

export interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  compare_price: number | null;
  avg_rating: number;
  sales_count: number;
  is_featured: boolean;
  tags: string[];
  origin: string | null;
  category_id: string;
  category_name: string;
  primary_image: string | null;
  _rankingScore?: number;
}
