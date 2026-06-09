"use server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type WishlistVariant = {
  id: string;
  name: string;
  price_modifier: number;
  product: {
    id: string; name: string; slug: string; base_price: number; avg_rating: number;
    images: { url: string; is_primary: boolean }[];
  } | null;
};
export type WishlistItem = { id: string; created_at: string; variant: WishlistVariant | null };

export async function toggleWishlist(variantId: string) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to save items" };

  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("variant_id", variantId)
    .single();

  if (existing) {
    await supabase.from("wishlists").delete().eq("id", existing.id);
    revalidatePath("/account/wishlist");
    return { action: "removed" };
  } else {
    await supabase.from("wishlists").insert({ user_id: user.id, variant_id: variantId });
    revalidatePath("/account/wishlist");
    return { action: "added" };
  }
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("wishlists")
    .select(`
      id, created_at,
      variant:product_variants(
        id, name, price_modifier,
        product:products(id, name, slug, base_price, avg_rating, images:product_images(url, is_primary))
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as WishlistItem[];
}
