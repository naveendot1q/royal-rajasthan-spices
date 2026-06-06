import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { ProductForm } from "@/components/products/product-form";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface EditProductPageProps { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createAdminSupabaseServer();

  const [productRes, categoriesRes] = await Promise.all([
    supabase.from("products").select(`*, category:product_categories(id, name), images:product_images(*), variants:product_variants(*, inventory(*))`).eq("id", id).single(),
    supabase.from("product_categories").select("id, name, slug, parent_id").eq("is_active", true).is("deleted_at", null).order("name"),
  ]);

  if (!productRes.data) notFound();
  const product = productRes.data;

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <a href="/products" className="hover:text-gray-700">Products</a>
            <span>/</span>
            <span className="text-gray-700">Edit</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{product.name}</h1>
        </div>
        <div className="flex gap-3">
          <a
            href={`${process.env.NEXT_PUBLIC_CUSTOMER_URL || "http://localhost:3000"}/products/${product.slug}`}
            target="_blank"
            className="btn-secondary text-xs"
          >
            View on Store ↗
          </a>
        </div>
      </div>
      <ProductForm
        categories={categoriesRes.data || []}
        defaultValues={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description || undefined,
          category_id: product.category_id,
          sku: product.sku || undefined,
          base_price: product.base_price,
          compare_price: product.compare_price || undefined,
          status: product.status as "draft" | "active" | "archived",
          is_featured: product.is_featured,
          origin: product.origin || undefined,
          weight_grams: product.weight_grams || undefined,
          tags: (product.tags as string[]).join(", "),
        }}
      />
    </div>
  );
}
