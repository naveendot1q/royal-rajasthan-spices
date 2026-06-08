export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: string | null
          preferences: Json
          loyalty_pts: number
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          permissions: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['roles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['roles']['Insert']>
      }
      user_roles: {
        Row: {
          user_id: string
          role_id: string
          assigned_by: string | null
          assigned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'assigned_at'>
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          phone: string
          line1: string
          line2: string | null
          city: string
          state: string
          pincode: string
          country: string
          is_default: boolean
          lat: number | null
          lng: number | null
          created_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['addresses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>
      }
      product_categories: {
        Row: {
          id: string
          parent_id: string | null
          name: string
          slug: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          meta: Json
          created_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['product_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_categories']['Insert']>
      }
      products: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          sku: string | null
          base_price: number
          compare_price: number | null
          cost_price: number | null
          status: string
          is_featured: boolean
          tags: string[]
          origin: string | null
          weight_grams: number | null
          nutritional_info: Json
          meta: Json
          search_vector: string | null
          sales_count: number
          avg_rating: number
          review_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at' | 'sales_count' | 'avg_rating' | 'review_count' | 'search_vector'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string | null
          price_modifier: number
          weight_grams: number | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>
      }
      inventory: {
        Row: {
          id: string
          variant_id: string
          warehouse_id: string | null
          quantity: number
          reserved_qty: number
          low_stock_threshold: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>
      }
      inventory_logs: {
        Row: {
          id: string
          variant_id: string
          delta: number
          reason: string
          reference_id: string | null
          actor_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['inventory_logs']['Insert']>
      }
      coupons: {
        Row: {
          id: string
          code: string
          type: string
          value: number
          min_order: number
          max_discount: number | null
          max_uses: number | null
          used_count: number
          user_limit: number
          is_active: boolean
          starts_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at' | 'used_count'>
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['carts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['carts']['Insert']>
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          variant_id: string
          quantity: number
          price_snapshot: number
          saved_for_later: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cart_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cart_items']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          status: string
          subtotal: number
          discount_amount: number
          shipping_fee: number
          tax_amount: number
          total: number
          currency: string
          payment_method: string | null
          coupon_id: string | null
          address_snapshot: Json
          notes: string | null
          gst_invoice_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string | null
          name_snapshot: string
          image_snapshot: string | null
          sku_snapshot: string | null
          price: number
          quantity: number
          fulfilled_qty: number
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      payments: {
        Row: {
          id: string
          order_id: string
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          amount: number
          currency: string
          status: string
          captured_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      refunds: {
        Row: {
          id: string
          payment_id: string
          amount: number
          reason: string | null
          status: string
          provider_refund_id: string | null
          processed_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['refunds']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['refunds']['Insert']>
      }
      tracking_updates: {
        Row: {
          id: string
          order_id: string
          status: string
          location: string | null
          description: string
          occurred_at: string
          created_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['tracking_updates']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['tracking_updates']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          body: string | null
          images: string[]
          status: string
          is_verified_purchase: boolean
          is_featured: boolean
          helpful_count: number
          moderated_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'helpful_count'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          variant_id: string
          note: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['wishlists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['wishlists']['Insert']>
      }
      support_tickets: {
        Row: {
          id: string
          ticket_number: string
          user_id: string
          order_id: string | null
          subject: string
          status: string
          priority: string
          assigned_to: string | null
          resolved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['support_tickets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['support_tickets']['Insert']>
      }
      support_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_id: string
          body: string
          attachments: string[]
          is_internal: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['support_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['support_messages']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          data: Json
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
      banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image_url: string
          mobile_image_url: string | null
          link: string | null
          cta_text: string | null
          position: string
          sort_order: number
          is_active: boolean
          starts_at: string | null
          ends_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['banners']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['banners']['Insert']>
      }
      cms_pages: {
        Row: {
          id: string
          slug: string
          title: string
          body: string | null
          meta: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['cms_pages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cms_pages']['Insert']>
      }
      blogs: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          body: string | null
          cover_image: string | null
          author_id: string | null
          tags: string[]
          published_at: string | null
          seo: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['blogs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['blogs']['Insert']>
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['system_settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['system_settings']['Insert']>
      }
      shipping_methods: {
        Row: {
          id: string
          name: string
          description: string | null
          provider: string
          base_price: number
          free_above: number | null
          estimated_days: number | null
          is_active: boolean
          sort_order: number
        }
        Insert: Omit<Database['public']['Tables']['shipping_methods']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['shipping_methods']['Insert']>
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
