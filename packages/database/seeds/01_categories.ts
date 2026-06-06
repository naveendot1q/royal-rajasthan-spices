import { createServiceClient } from "../src/client";

const CATEGORIES = [
  { name: "Whole Spices", slug: "whole-spices", sort_order: 1, description: "Pure, unground spices for maximum aroma and flavor" },
  { name: "Ground Spices", slug: "ground-spices", sort_order: 2, description: "Freshly stone-ground for immediate use" },
  { name: "Spice Blends", slug: "spice-blends", sort_order: 3, description: "Expertly crafted blends from royal kitchen recipes" },
  { name: "Seeds & Nuts", slug: "seeds-and-nuts", sort_order: 4, description: "Premium seeds and dry fruits" },
  { name: "Exotic & Rare", slug: "exotic-rare", sort_order: 5, description: "Rare and exotic spices from across India" },
  { name: "Gift Sets", slug: "gift-sets", sort_order: 6, description: "Curated gift collections for the spice lover" },
];

export async function seedCategories() {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("product_categories").upsert(CATEGORIES, { onConflict: "slug" });
  if (error) console.error("Category seed error:", error);
  else console.log("✓ Categories seeded:", data?.length || CATEGORIES.length);
}
