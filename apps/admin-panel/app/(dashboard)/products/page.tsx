import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@rrs/shared";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Plus, Package } from "lucide-react";

export const metadata: Metadata = { title: "Products" };

interface ProductsPageProps {
  searchParams: Promise<{ status?: string; page?: string; q?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { status, page: pageStr = "1", q, category } = await searchParams;
  const supabase = await createAdminSupabaseServer();
  const page = Number(pageStr);
  const pageSize = 25;

  let query = supabase
    .from("products")
    .select(`
      id, name, slug, status, base_price, sales_count, avg_rating,
      review_count, created_at, is_featured,
      category:product_categories(name),
      images:product_images(url, is_primary),
      variants:product_variants(id, is_active,
        inventory(quantity, reserved_qty, low_stock_threshold))
    `, { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status && status !== "all") query = query.eq("status", status);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{count?.toLocaleString("en-IN")} products</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Import CSV</button>
          <button className="btn-secondary">Export CSV</button>
          <Link href="/products/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card-admin p-4 flex gap-4 flex-wrap items-center">
        <div className="flex gap-2">
          {["all", "active", "draft", "archived"].map((s) => (
            <Link key={s} href={`/products?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                (status || "all") === s ? "bg-royal-gold-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {s}
            </Link>
          ))}
        </div>
        <input defaultValue={q} placeholder="Search products…" className="input-admin max-w-xs" />
      </div>

      {/* Table */}
      <div className="card-admin overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500">
                <th className="text-left px-5 py-3 font-medium w-10">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left px-5 py-3 font-medium">Product</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-right px-5 py-3 font-medium">Price</th>
                <th className="text-right px-5 py-3 font-medium">Stock</th>
                <th className="text-right px-5 py-3 font-medium">Sales</th>
                <th className="text-right px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(products || []).map((product) => {
                type Inventory = { quantity: number; reserved_qty: number; low_stock_threshold: number };
                type Variant = { id: string; is_active: boolean; inventory: Inventory | null };
                const image = (product.images as { url: string; is_primary: boolean }[])?.find((i) => i.is_primary)?.url;
                const variants = product.variants as Variant[];
                const totalStock = variants?.reduce((sum, v) => sum + ((v.inventory?.quantity || 0) - (v.inventory?.reserved_qty || 0)), 0) || 0;
                const isLowStock = variants?.some((v) => (v.inventory?.quantity || 0) <= (v.inventory?.low_stock_threshold || 10));
                const category = product.category as { name: string } | null;

                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {image ? <Image src={image} alt={product.name} width={40} height={40} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-lg">🌶</div>}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                          {product.is_featured && <span className="text-xs text-royal-gold-600 font-medium">⭐ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{category?.name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        product.status === "active" ? "bg-emerald-100 text-emerald-700" :
                        product.status === "draft" ? "bg-gray-100 text-gray-600" :
                        "bg-red-100 text-red-600"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-900 text-sm">{formatCurrency(product.base_price)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-sm font-medium ${totalStock === 0 ? "text-red-600" : isLowStock ? "text-amber-600" : "text-gray-800"}`}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-600">{product.sales_count.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-gray-600">
                      {product.avg_rating > 0 ? `★ ${product.avg_rating.toFixed(1)}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/products/${product.id}/edit`} className="text-xs text-royal-gold-600 hover:underline font-medium mr-2">Edit</Link>
                      <button className="text-xs text-red-400 hover:text-red-600 font-medium">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && <Link href={`/products?page=${page - 1}&status=${status || "all"}`} className="btn-secondary px-3 py-1.5 text-xs">Previous</Link>}
              {page < totalPages && <Link href={`/products?page=${page + 1}&status=${status || "all"}`} className="btn-secondary px-3 py-1.5 text-xs">Next</Link>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
