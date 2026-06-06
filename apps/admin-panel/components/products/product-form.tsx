"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Upload } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, hyphens"),
  description: z.string().optional(),
  category_id: z.string().uuid("Select a category"),
  sku: z.string().optional(),
  base_price: z.number().positive("Price must be positive"),
  compare_price: z.number().positive().optional(),
  status: z.enum(["draft", "active", "archived"]),
  is_featured: z.boolean(),
  origin: z.string().optional(),
  weight_grams: z.number().int().positive().optional(),
  tags: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category { id: string; name: string; slug: string; parent_id: string | null; }

export function ProductForm({ categories, defaultValues }: {
  categories: Category[];
  defaultValues?: Partial<ProductFormData & { id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([
    { name: "250g", price_modifier: 0, weight_grams: 250, stock: 100 },
    { name: "500g", price_modifier: 50, weight_grams: 500, stock: 100 },
    { name: "1kg", price_modifier: 120, weight_grams: 1000, stock: 50 },
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; is_primary: boolean }[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "draft",
      is_featured: false,
      ...defaultValues,
    },
  });

  const name = watch("name");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createSupabaseClient();
      const ext = file.name.split(".").pop();
      const path = `products/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
      setUploadedImages((prev) => [...prev, { url: publicUrl, is_primary: prev.length === 0 }]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();

      const { data: product, error } = await supabase.from("products").insert({
        ...data,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        compare_price: data.compare_price || null,
        weight_grams: data.weight_grams || null,
        origin: data.origin || null,
        sku: data.sku || null,
      }).select().single();

      if (error) throw error;

      // Insert variants with inventory
      for (const variant of variants) {
        const { data: v } = await supabase.from("product_variants").insert({
          product_id: product.id,
          name: variant.name,
          price_modifier: variant.price_modifier,
          weight_grams: variant.weight_grams,
        }).select().single();

        if (v) {
          await supabase.from("inventory").insert({
            variant_id: v.id,
            quantity: variant.stock,
          });
        }
      }

      // Insert images
      if (uploadedImages.length > 0) {
        await supabase.from("product_images").insert(
          uploadedImages.map((img, i) => ({ product_id: product.id, url: img.url, is_primary: i === 0, sort_order: i }))
        );
      }

      // Sync to Meilisearch
      await fetch("/api/products/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      toast.success("Product created successfully!");
      router.push(`/products/${product.id}/edit`);
    } catch (err) {
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => setVariants([...variants, { name: "", price_modifier: 0, weight_grams: 0, stock: 0 }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="card-admin p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Product Name *</label>
            <input {...register("name")} onBlur={() => {
              if (name && !watch("slug")) {
                setValue("slug", name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
              }
            }} className="input-admin" placeholder="e.g. Premium Rajasthani Red Chilli" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">URL Slug *</label>
            <input {...register("slug")} className="input-admin font-mono" placeholder="premium-rajasthani-red-chilli" />
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">SKU</label>
            <input {...register("sku")} className="input-admin font-mono" placeholder="RRS-CHILLI-001" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Category *</label>
            <select {...register("category_id")} className="input-admin">
              <option value="">Select category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.parent_id ? "  └ " : ""}{cat.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
            <select {...register("status")} className="input-admin">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
            <textarea {...register("description")} rows={4} className="input-admin resize-none" placeholder="Describe the spice, its origin, uses, and flavor profile…" />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="card-admin p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Pricing</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Base Price (₹) *</label>
            <input {...register("base_price", { valueAsNumber: true })} type="number" step="0.01" className="input-admin" placeholder="199" />
            {errors.base_price && <p className="text-xs text-red-500 mt-1">{errors.base_price.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Compare Price (₹)</label>
            <input {...register("compare_price", { valueAsNumber: true })} type="number" step="0.01" className="input-admin" placeholder="299" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Weight (grams)</label>
            <input {...register("weight_grams", { valueAsNumber: true })} type="number" className="input-admin" placeholder="250" />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="card-admin p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Variants & Stock</h2>
          <button type="button" onClick={addVariant} className="btn-secondary flex items-center gap-1.5 text-xs">
            <Plus size={13} /> Add Variant
          </button>
        </div>
        <div className="space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-4 gap-3 items-end p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Variant Name</label>
                <input
                  value={v.name}
                  onChange={(e) => setVariants(variants.map((vv, ii) => ii === i ? { ...vv, name: e.target.value } : vv))}
                  className="input-admin text-xs" placeholder="250g"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Price Modifier (₹)</label>
                <input
                  type="number"
                  value={v.price_modifier}
                  onChange={(e) => setVariants(variants.map((vv, ii) => ii === i ? { ...vv, price_modifier: Number(e.target.value) } : vv))}
                  className="input-admin text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Initial Stock</label>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => setVariants(variants.map((vv, ii) => ii === i ? { ...vv, stock: Number(e.target.value) } : vv))}
                  className="input-admin text-xs"
                />
              </div>
              <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors self-end mb-0.5">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="card-admin p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Product Images</h2>
        <div className="flex gap-4 flex-wrap mb-4">
          {uploadedImages.map((img, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-royal-gold-300">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              {i === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-royal-gold-500 text-white text-xs rounded">Primary</span>}
              <button type="button" onClick={() => setUploadedImages(uploadedImages.filter((_, ii) => ii !== i))}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
            </div>
          ))}
          <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-royal-gold-400 hover:bg-royal-gold-50 transition-colors">
            {uploading ? <Loader2 size={20} className="animate-spin text-gray-400" /> : <Upload size={20} className="text-gray-400" />}
            <span className="text-xs text-gray-400 mt-1">Upload</span>
            <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      {/* Additional */}
      <div className="card-admin p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Additional Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Origin</label>
            <input {...register("origin")} className="input-admin" placeholder="e.g. Rajasthan, India" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags (comma-separated)</label>
            <input {...register("tags")} className="input-admin" placeholder="organic, premium, bestseller" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_featured" {...register("is_featured")} className="rounded border-gray-300 text-royal-gold-600 w-4 h-4" />
            <label htmlFor="is_featured" className="text-sm text-gray-700">Feature this product on homepage</label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-50">
          {loading && <Loader2 size={15} className="animate-spin" />}
          {defaultValues?.id ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary px-6 py-2.5">Cancel</button>
      </div>
    </form>
  );
}
