"use server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { reviewSchema } from "@rrs/shared";

export async function submitReview(productId: string, orderId: string | null, formData: FormData) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to write a review" };

  const parsed = reviewSchema.safeParse({
    rating: Number(formData.get("rating")),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Check if verified purchase
  let isVerified = false;
  if (orderId) {
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .eq("variant_id", (await supabase.from("product_variants").select("id").eq("product_id", productId).limit(1).single()).data?.id || "")
      .single();
    isVerified = !!orderItem;
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    order_id: orderId,
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    body: parsed.data.body,
    is_verified_purchase: isVerified,
    status: "pending",
  });

  if (error) return { error: "Could not submit review. You may have already reviewed this product." };

  revalidatePath(`/products/${productId}`);
  return { success: true };
}
