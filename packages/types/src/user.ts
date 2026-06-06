export type UserRole = "super_admin" | "admin" | "staff" | "customer";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  preferences: Record<string, unknown>;
  loyalty_pts: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  price_snapshot: number;
  saved_for_later: boolean;
  product?: {
    id: string;
    name: string;
    slug: string;
    primary_image: string | null;
  };
  variant?: {
    id: string;
    name: string;
    sku: string | null;
  };
}

export interface WishlistItem {
  id: string;
  user_id: string;
  variant_id: string;
  note: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
    primary_image: string | null;
    avg_rating: number;
  };
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  images: string[];
  status: "pending" | "approved" | "rejected";
  is_verified_purchase: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  min_order: number;
  max_discount: number | null;
  max_uses: number | null;
  used_count: number;
  user_limit: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
}
