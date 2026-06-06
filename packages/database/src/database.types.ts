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
          sales_count: number
          avg_rating: number
          review_count: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at' | 'sales_count' | 'avg_rating' | 'review_count'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
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
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
