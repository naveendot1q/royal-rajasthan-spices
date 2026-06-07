export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          deleted_at: string | null
          full_name: string
          id: string
          is_default: boolean
          label: string
          lat: number | null
          line1: string
          line2: string | null
          lng: number | null
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          deleted_at?: string | null
          full_name: string
          id?: string
          is_default?: boolean
          label?: string
          lat?: number | null
          line1: string
          line2?: string | null
          lng?: number | null
          phone: string
          pincode: string
          state: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          deleted_at?: string | null
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string
          lat?: number | null
          line1?: string
          line2?: string | null
          lng?: number | null
          phone?: string
          pincode?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          cta_text: string | null
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean
          link: string | null
          mobile_image_url: string | null
          position: string
          sort_order: number
          starts_at: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          cta_text?: string | null
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link?: string | null
          mobile_image_url?: string | null
          position?: string
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          cta_text?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link?: string | null
          mobile_image_url?: string | null
          position?: string
          sort_order?: number
          starts_at?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          author_id: string | null
          body: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          seo: Json
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo?: Json
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          seo?: Json
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          price_snapshot: number
          quantity: number
          saved_for_later: boolean
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          price_snapshot: number
          quantity?: number
          saved_for_later?: boolean
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          price_snapshot?: number
          quantity?: number
          saved_for_later?: boolean
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_active: boolean
          meta: Json
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          meta?: Json
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          meta?: Json
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          max_uses: number | null
          min_order: number
          starts_at: string | null
          type: string
          used_count: number
          user_limit: number
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          max_uses?: number | null
          min_order?: number
          starts_at?: string | null
          type: string
          used_count?: number
          user_limit?: number
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          max_uses?: number | null
          min_order?: number
          starts_at?: string | null
          type?: string
          used_count?: number
          user_limit?: number
          value?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          id: string
          low_stock_threshold: number
          quantity: number
          reserved_qty: number
          updated_at: string
          variant_id: string
          warehouse_id: string | null
        }
        Insert: {
          id?: string
          low_stock_threshold?: number
          quantity?: number
          reserved_qty?: number
          updated_at?: string
          variant_id: string
          warehouse_id?: string | null
        }
        Update: {
          id?: string
          low_stock_threshold?: number
          quantity?: number
          reserved_qty?: number
          updated_at?: string
          variant_id?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_logs: {
        Row: {
          actor_id: string | null
          created_at: string
          delta: number
          id: string
          reason: string
          reference_id: string | null
          variant_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          delta: number
          id?: string
          reason: string
          reference_id?: string | null
          variant_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          delta?: number
          id?: string
          reason?: string
          reference_id?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_logs_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          is_read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          is_read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          fulfilled_qty: number
          id: string
          image_snapshot: string | null
          name_snapshot: string
          order_id: string
          price: number
          quantity: number
          sku_snapshot: string | null
          variant_id: string | null
        }
        Insert: {
          fulfilled_qty?: number
          id?: string
          image_snapshot?: string | null
          name_snapshot: string
          order_id: string
          price: number
          quantity: number
          sku_snapshot?: string | null
          variant_id?: string | null
        }
        Update: {
          fulfilled_qty?: number
          id?: string
          image_snapshot?: string | null
          name_snapshot?: string
          order_id?: string
          price?: number
          quantity?: number
          sku_snapshot?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_snapshot: Json
          coupon_id: string | null
          created_at: string
          currency: string
          discount_amount: number
          gst_invoice_url: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          shipping_fee: number
          status: string
          subtotal: number
          tax_amount: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_snapshot: Json
          coupon_id?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          gst_invoice_url?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          shipping_fee?: number
          status?: string
          subtotal: number
          tax_amount?: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_snapshot?: Json
          coupon_id?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number
          gst_invoice_url?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          shipping_fee?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          captured_at: string | null
          created_at: string
          currency: string
          id: string
          metadata: Json
          order_id: string
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          status: string
        }
        Insert: {
          amount: number
          captured_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          order_id: string
          provider: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string
        }
        Update: {
          amount?: number
          captured_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          order_id?: string
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          meta: Json
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          meta?: Json
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          meta?: Json
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          price_modifier: number
          product_id: string
          sku: string | null
          sort_order: number
          weight_grams: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          price_modifier?: number
          product_id: string
          sku?: string | null
          sort_order?: number
          weight_grams?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          price_modifier?: number
          product_id?: string
          sku?: string | null
          sort_order?: number
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_rating: number
          base_price: number
          category_id: string
          compare_price: number | null
          cost_price: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_featured: boolean
          meta: Json
          name: string
          nutritional_info: Json
          origin: string | null
          review_count: number
          sales_count: number
          search_vector: unknown
          sku: string | null
          slug: string
          status: string
          tags: string[]
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          avg_rating?: number
          base_price: number
          category_id: string
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          meta?: Json
          name: string
          nutritional_info?: Json
          origin?: string | null
          review_count?: number
          sales_count?: number
          search_vector?: unknown
          sku?: string | null
          slug: string
          status?: string
          tags?: string[]
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          avg_rating?: number
          base_price?: number
          category_id?: string
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean
          meta?: Json
          name?: string
          nutritional_info?: Json
          origin?: string | null
          review_count?: number
          sales_count?: number
          search_vector?: unknown
          sku?: string | null
          slug?: string
          status?: string
          tags?: string[]
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          is_verified: boolean
          loyalty_pts: number
          phone: string | null
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          is_verified?: boolean
          loyalty_pts?: number
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          is_verified?: boolean
          loyalty_pts?: number
          phone?: string | null
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_id: string
          processed_at: string | null
          provider_refund_id: string | null
          reason: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_id: string
          processed_at?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_id?: string
          processed_at?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          helpful_count: number
          id: string
          images: string[]
          is_featured: boolean
          is_verified_purchase: boolean
          moderated_by: string | null
          order_id: string | null
          product_id: string
          rating: number
          status: string
          title: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          images?: string[]
          is_featured?: boolean
          is_verified_purchase?: boolean
          moderated_by?: string | null
          order_id?: string | null
          product_id: string
          rating: number
          status?: string
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          images?: string[]
          is_featured?: boolean
          is_verified_purchase?: boolean
          moderated_by?: string | null
          order_id?: string | null
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          permissions: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          permissions?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          permissions?: Json
        }
        Relationships: []
      }
      shipping_methods: {
        Row: {
          base_price: number
          description: string | null
          estimated_days: number | null
          free_above: number | null
          id: string
          is_active: boolean
          name: string
          provider: string
          sort_order: number
        }
        Insert: {
          base_price?: number
          description?: string | null
          estimated_days?: number | null
          free_above?: number | null
          id?: string
          is_active?: boolean
          name: string
          provider?: string
          sort_order?: number
        }
        Update: {
          base_price?: number
          description?: string | null
          estimated_days?: number | null
          free_above?: number | null
          id?: string
          is_active?: boolean
          name?: string
          provider?: string
          sort_order?: number
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: string[]
          body: string
          created_at: string
          id: string
          is_internal: boolean
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: string[]
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: string[]
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          id: string
          order_id: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      tracking_updates: {
        Row: {
          created_by: string | null
          description: string
          id: string
          location: string | null
          occurred_at: string
          order_id: string
          status: string
        }
        Insert: {
          created_by?: string | null
          description: string
          id?: string
          location?: string | null
          occurred_at?: string
          order_id: string
          status: string
        }
        Update: {
          created_by?: string | null
          description?: string
          id?: string
          location?: string | null
          occurred_at?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          note: string | null
          user_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          user_id: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      has_role: { Args: { role_name: string }; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
