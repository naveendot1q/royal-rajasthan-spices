"use server";

import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { generateSessionId } from "@rrs/shared";

const addToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(50),
});

type CartVariant = {
  id: string; name: string; sku: string | null;
  product: {
    id: string; name: string; slug: string;
    images: { url: string; is_primary: boolean }[];
  } | null;
};
export type CartItem = {
  id: string; quantity: number; price_snapshot: number; saved_for_later: boolean;
  variant: CartVariant | null;
};

async function getOrCreateCart(supabase: Awaited<ReturnType<typeof createSupabaseServer>>) {
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cart_session")?.value;

  if (!sessionId && !user) {
    sessionId = generateSessionId();
  }

  if (user) {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .is("expires_at", null)
      .single();

    if (cart) return cart.id;

    if (sessionId) {
      const { data: sessionCart } = await supabase
        .from("carts")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (sessionCart) {
        await supabase.from("carts").update({ user_id: user.id, session_id: null }).eq("id", sessionCart.id);
        return sessionCart.id;
      }
    }

    const { data: newCart } = await supabase.from("carts").insert({ user_id: user.id }).select("id").single();
    return newCart!.id;
  }

  if (sessionId) {
    const { data: cart } = await supabase.from("carts").select("id").eq("session_id", sessionId).single();
    if (cart) return cart.id;
  }

  const newSessionId = sessionId || generateSessionId();
  const { data: newCart } = await supabase
    .from("carts")
    .insert({ session_id: newSessionId, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
    .select("id")
    .single();

  return newCart!.id;
}

export async function addToCart(formData: FormData) {
  const supabase = await createSupabaseServer();

  const parsed = addToCartSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: Number(formData.get("quantity") || 1),
  });
  if (!parsed.success) return { error: "Invalid input" };

  const { data: inventory } = await supabase
    .from("inventory")
    .select("quantity, reserved_qty")
    .eq("variant_id", parsed.data.variantId)
    .single();

  const available = (inventory?.quantity ?? 0) - (inventory?.reserved_qty ?? 0);
  if (available < parsed.data.quantity) return { error: "Not enough stock available" };

  const { data: rawVariant } = await supabase
    .from("product_variants")
    .select("price_modifier, product:products(base_price)")
    .eq("id", parsed.data.variantId)
    .single();

  if (!rawVariant) return { error: "Product not found" };
  const variant = rawVariant as unknown as { price_modifier: number; product: { base_price: number } | null };
  const priceSnapshot = (variant.product?.base_price ?? 0) + variant.price_modifier;

  const cartId = await getOrCreateCart(supabase);

  const { error } = await supabase.from("cart_items").upsert(
    { cart_id: cartId, variant_id: parsed.data.variantId, quantity: parsed.data.quantity, price_snapshot: priceSnapshot },
    { onConflict: "cart_id,variant_id,saved_for_later" }
  );

  if (error) return { error: "Could not add to cart" };

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartQuantity(itemId: string, quantity: number) {
  const supabase = await createSupabaseServer();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
  }

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(itemId: string) {
  const supabase = await createSupabaseServer();
  await supabase.from("cart_items").delete().eq("id", itemId);
  revalidatePath("/cart");
  return { success: true };
}

export async function saveForLater(itemId: string) {
  const supabase = await createSupabaseServer();
  await supabase.from("cart_items").update({ saved_for_later: true }).eq("id", itemId);
  revalidatePath("/cart");
  return { success: true };
}

export async function moveToCart(itemId: string) {
  const supabase = await createSupabaseServer();
  await supabase.from("cart_items").update({ saved_for_later: false }).eq("id", itemId);
  revalidatePath("/cart");
  return { success: true };
}

export async function getCartItems(): Promise<{ items: CartItem[]; savedItems: CartItem[] }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cart_session")?.value;

  let cartQuery = supabase.from("carts").select("id");
  if (user) {
    cartQuery = cartQuery.eq("user_id", user.id);
  } else if (sessionId) {
    cartQuery = cartQuery.eq("session_id", sessionId);
  } else {
    return { items: [], savedItems: [] };
  }

  const { data: cart } = await cartQuery.single();
  if (!cart) return { items: [], savedItems: [] };

  const { data: rawItems } = await supabase
    .from("cart_items")
    .select(`
      id, quantity, price_snapshot, saved_for_later,
      variant:product_variants(
        id, name, sku,
        product:products(id, name, slug, images:product_images(url, is_primary))
      )
    `)
    .eq("cart_id", cart.id)
    .order("created_at");

  const items = (rawItems ?? []) as unknown as CartItem[];

  return {
    items: items.filter((i) => !i.saved_for_later),
    savedItems: items.filter((i) => i.saved_for_later),
  };
}
