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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          { foreignKeyName: "user_roles_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "user_roles_role_id_fkey"; columns: ["role_id"]; referencedRelation: "roles"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "addresses_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "product_categories_parent_id_fkey"; columns: ["parent_id"]; referencedRelation: "product_categories"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; referencedRelation: "product_categories"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "product_images_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "product_variants_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "inventory_variant_id_fkey"; columns: ["variant_id"]; referencedRelation: "product_variants"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "inventory_logs_variant_id_fkey"; columns: ["variant_id"]; referencedRelation: "product_variants"; referencedColumns: ["id"] }
        ]
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
        Relationships: []
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
        Relationships: [
          { foreignKeyName: "carts_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "cart_items_cart_id_fkey"; columns: ["cart_id"]; referencedRelation: "carts"; referencedColumns: ["id"] },
          { foreignKeyName: "cart_items_variant_id_fkey"; columns: ["variant_id"]; referencedRelation: "product_variants"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "orders_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "orders_coupon_id_fkey"; columns: ["coupon_id"]; referencedRelation: "coupons"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "order_items_variant_id_fkey"; columns: ["variant_id"]; referencedRelation: "product_variants"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "payments_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "refunds_payment_id_fkey"; columns: ["payment_id"]; referencedRelation: "payments"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "tracking_updates_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "reviews_product_id_fkey"; columns: ["product_id"]; referencedRelation: "products"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "reviews_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "wishlists_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "wishlists_variant_id_fkey"; columns: ["variant_id"]; referencedRelation: "product_variants"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "support_tickets_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "support_tickets_order_id_fkey"; columns: ["order_id"]; referencedRelation: "orders"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "support_messages_ticket_id_fkey"; columns: ["ticket_id"]; referencedRelation: "support_tickets"; referencedColumns: ["id"] },
          { foreignKeyName: "support_messages_sender_id_fkey"; columns: ["sender_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
        Relationships: [
          { foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: [
          { foreignKeyName: "blogs_author_id_fkey"; columns: ["author_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ]
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
        Relationships: []
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
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
