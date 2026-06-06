import { ProductForm } from "@/components/products/product-form";
import { createAdminSupabaseServer } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const supabase = await createAdminSupabaseServer();
  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, name, slug, parent_id")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name");

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500">Fill in the details below to add a new spice to your store</p>
      </div>
      <ProductForm categories={categories || []} />
    </div>
  );
}
