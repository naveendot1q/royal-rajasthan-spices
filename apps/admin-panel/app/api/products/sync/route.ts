import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@rrs/database";
import { indexProducts, updateProduct } from "@rrs/search";
import type { SearchProduct } from "@rrs/types";

export async function POST(req: NextRequest) {
  const { productId } = await req.json().catch(() => ({}));
  const supabase = createServiceClient();

  try {
    let query = supabase
      .from("products")
      .select(`
        id, name, slug, description, base_price, compare_price,
        avg_rating, review_count, sales_count, is_featured,
        tags, origin,
        category:product_categories(id, name),
        images:product_images(url, is_primary),
        variants:product_variants(id, is_active, inventory(quantity, reserved_qty))
      `)
      .eq("status", "active")
      .is("deleted_at", null);

    if (productId) query = (query as ReturnType<typeof query.eq>).eq("id", productId);

    const { data: products, error } = await query;
    if (error) throw error;

    const searchProducts: SearchProduct[] = (products || []).map((p) => {
      const images = p.images as { url: string; is_primary: boolean }[];
      const variants = p.variants as { id: string; is_active: boolean; inventory: { quantity: number; reserved_qty: number } | null }[];
      const totalStock = variants?.reduce((sum, v) => sum + Math.max(0, (v.inventory?.quantity || 0) - (v.inventory?.reserved_qty || 0)), 0) || 0;
      const category = p.category as { id: string; name: string } | null;

      return {
        id: p.id, name: p.name, slug: p.slug, description: p.description || "",
        base_price: p.base_price, compare_price: p.compare_price,
        avg_rating: p.avg_rating, review_count: p.review_count, sales_count: p.sales_count,
        is_featured: p.is_featured, tags: p.tags, origin: p.origin,
        category_id: category?.id || "", category_name: category?.name || "",
        primary_image: images?.find((i) => i.is_primary)?.url || images?.[0]?.url || null,
        has_stock: totalStock > 0,
        price_range: p.base_price < 150 ? "under-150" : p.base_price < 300 ? "150-300" : p.base_price < 500 ? "300-500" : "above-500",
      };
    });

    if (productId && searchProducts.length === 1) {
      await updateProduct(searchProducts[0]);
    } else {
      await indexProducts(searchProducts);
    }

    return NextResponse.json({ success: true, indexed: searchProducts.length });
  } catch (err) {
    return NextResponse.json({ error: "Sync failed", details: String(err) }, { status: 500 });
  }
}
