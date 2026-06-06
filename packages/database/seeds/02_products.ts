import { createServiceClient } from "../src/client";

const SPICE_PRODUCTS = [
  {
    name: "Premium Lal Mirch (Red Chilli Powder)",
    slug: "premium-lal-mirch-red-chilli-powder",
    description: "The crown jewel of Rajasthani cuisine. Our Lal Mirch is sourced from the fertile fields of Mathania, Jodhpur — the same variety used in royal kitchens for centuries. Deep red in color, vibrant in aroma, and perfectly balanced in heat. No artificial colors, no fillers.",
    base_price: 189,
    compare_price: 249,
    is_featured: true,
    origin: "Mathania, Jodhpur, Rajasthan",
    tags: ["bestseller", "premium", "no-additives", "bold-flavor"],
    nutritional_info: { "Energy": "282 kcal/100g", "Protein": "14g", "Fat": "12g", "Carbohydrate": "56g", "Vitamin C": "76mg" },
    status: "active",
    category_slug: "ground-spices",
    variants: [
      { name: "100g", price_modifier: -50, weight_grams: 100, stock: 200 },
      { name: "250g", price_modifier: 0, weight_grams: 250, stock: 150 },
      { name: "500g", price_modifier: 150, weight_grams: 500, stock: 100 },
      { name: "1 kg", price_modifier: 360, weight_grams: 1000, stock: 50 },
    ],
  },
  {
    name: "Royal Garam Masala — Heritage Blend",
    slug: "royal-garam-masala-heritage-blend",
    description: "A centuries-old royal blend of 23 hand-selected spices — cinnamon, cloves, cardamom, black pepper, nutmeg, mace, and more. Slow-roasted and stone-ground in small batches. The aroma is regal, complex, and utterly unique.",
    base_price: 299,
    compare_price: 399,
    is_featured: true,
    origin: "Jaipur, Rajasthan",
    tags: ["bestseller", "heritage-recipe", "blend", "premium"],
    nutritional_info: { "Energy": "340 kcal/100g", "Protein": "12g", "Fat": "16g", "Carbohydrate": "50g" },
    status: "active",
    category_slug: "spice-blends",
    variants: [
      { name: "50g", price_modifier: -100, weight_grams: 50, stock: 120 },
      { name: "100g", price_modifier: 0, weight_grams: 100, stock: 200 },
      { name: "250g", price_modifier: 200, weight_grams: 250, stock: 80 },
    ],
  },
  {
    name: "Lakadong Turmeric (High Curcumin)",
    slug: "lakadong-turmeric-high-curcumin",
    description: "The world's most prized turmeric from Lakadong, Meghalaya. Contains 7-12% curcumin vs. the standard 2-3%. Deep orange hue, earthy aroma, and potent anti-inflammatory properties. Trusted by Ayurvedic practitioners.",
    base_price: 349,
    compare_price: 449,
    is_featured: true,
    origin: "Lakadong, Meghalaya",
    tags: ["organic", "high-curcumin", "premium", "superfood"],
    nutritional_info: { "Energy": "312 kcal/100g", "Curcumin": "7-12%", "Iron": "55mg", "Manganese": "19.8mg" },
    status: "active",
    category_slug: "ground-spices",
    variants: [
      { name: "100g", price_modifier: 0, weight_grams: 100, stock: 180 },
      { name: "250g", price_modifier: 400, weight_grams: 250, stock: 90 },
      { name: "500g", price_modifier: 850, weight_grams: 500, stock: 40 },
    ],
  },
  {
    name: "Jeera (Cumin Seeds) — Desert Gold",
    slug: "jeera-cumin-seeds-desert-gold",
    description: "Hand-harvested cumin from the Nagaur district of Rajasthan — India's premier cumin growing region. Bold, warm, and intensely aromatic. These seeds are never machine-washed, preserving their natural oils.",
    base_price: 149,
    compare_price: 199,
    is_featured: false,
    origin: "Nagaur, Rajasthan",
    tags: ["whole-spice", "bestseller", "aromatic"],
    nutritional_info: { "Energy": "375 kcal/100g", "Iron": "66mg", "Magnesium": "366mg" },
    status: "active",
    category_slug: "whole-spices",
    variants: [
      { name: "100g", price_modifier: -50, weight_grams: 100, stock: 300 },
      { name: "250g", price_modifier: 0, weight_grams: 250, stock: 200 },
      { name: "500g", price_modifier: 120, weight_grams: 500, stock: 150 },
      { name: "1 kg", price_modifier: 280, weight_grams: 1000, stock: 80 },
    ],
  },
  {
    name: "Kali Mirch (Black Pepper) — Wayanad Reserve",
    slug: "kali-mirch-black-pepper-wayanad-reserve",
    description: "Premium Malabar black pepper from the Wayanad highlands of Kerala. Harvested at peak maturity, sun-dried on bamboo mats. Intensely pungent with a floral finish — the king of spices at its finest.",
    base_price: 399,
    compare_price: 499,
    is_featured: true,
    origin: "Wayanad, Kerala",
    tags: ["premium", "whole-spice", "gourmet"],
    nutritional_info: { "Energy": "251 kcal/100g", "Piperine": "5-9%", "Iron": "28mg" },
    status: "active",
    category_slug: "whole-spices",
    variants: [
      { name: "50g", price_modifier: -150, weight_grams: 50, stock: 100 },
      { name: "100g", price_modifier: 0, weight_grams: 100, stock: 150 },
      { name: "250g", price_modifier: 350, weight_grams: 250, stock: 60 },
    ],
  },
  {
    name: "Rajasthani Dhania (Coriander) Powder",
    slug: "rajasthani-dhania-coriander-powder",
    description: "Stone-ground coriander with a sweet, citrusy note unique to Rajasthan-grown seeds. An everyday essential elevated to gourmet quality.",
    base_price: 129,
    compare_price: 169,
    is_featured: false,
    origin: "Kota, Rajasthan",
    tags: ["everyday", "ground-spice", "budget-friendly"],
    status: "active",
    category_slug: "ground-spices",
    variants: [
      { name: "200g", price_modifier: 0, weight_grams: 200, stock: 250 },
      { name: "500g", price_modifier: 180, weight_grams: 500, stock: 150 },
      { name: "1 kg", price_modifier: 380, weight_grams: 1000, stock: 100 },
    ],
  },
  {
    name: "Elaichi (Green Cardamom) — Idukki Gold",
    slug: "elaichi-green-cardamom-idukki-gold",
    description: "The finest green cardamom pods from the Idukki highlands of Kerala. Intensely aromatic with a sweet, eucalyptus-like fragrance. Essential for biryanis, kheer, chai, and sweets.",
    base_price: 599,
    compare_price: 749,
    is_featured: true,
    origin: "Idukki, Kerala",
    tags: ["premium", "exotic", "whole-spice", "aromatic"],
    status: "active",
    category_slug: "whole-spices",
    variants: [
      { name: "25g", price_modifier: -200, weight_grams: 25, stock: 80 },
      { name: "50g", price_modifier: 0, weight_grams: 50, stock: 120 },
      { name: "100g", price_modifier: 350, weight_grams: 100, stock: 60 },
    ],
  },
  {
    name: "Royal Breakfast Gift Set",
    slug: "royal-breakfast-gift-set",
    description: "A beautifully curated gift box featuring 6 essential morning spices: Chai Masala, Jeera Powder, Haldi, Dhania, Kali Mirch, and Adrak Powder. Presented in an elegant wooden box with gold foil packaging. Perfect for gifting.",
    base_price: 899,
    compare_price: 1199,
    is_featured: true,
    origin: "Jaipur, Rajasthan",
    tags: ["gift", "premium", "set", "popular-gift"],
    status: "active",
    category_slug: "gift-sets",
    variants: [
      { name: "6-Spice Box", price_modifier: 0, weight_grams: 600, stock: 50 },
      { name: "12-Spice Box", price_modifier: 800, weight_grams: 1200, stock: 30 },
    ],
  },
];

export async function seedProducts() {
  const supabase = createServiceClient();

  for (const p of SPICE_PRODUCTS) {
    // Get category
    const { data: category } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", p.category_slug)
      .single();

    if (!category) { console.warn(`Category ${p.category_slug} not found`); continue; }

    const { variants, category_slug, ...productData } = p;

    // Upsert product
    const { data: product } = await supabase
      .from("products")
      .upsert({ ...productData, category_id: category.id, nutritional_info: p.nutritional_info || {} }, { onConflict: "slug" })
      .select()
      .single();

    if (!product) continue;

    for (let i = 0; i < variants.length; i++) {
      const { stock, ...variantData } = variants[i];
      const { data: variant } = await supabase
        .from("product_variants")
        .upsert({ ...variantData, product_id: product.id, sort_order: i }, { onConflict: "sku" })
        .select()
        .single();

      if (!variant) continue;

      await supabase.from("inventory").upsert({
        variant_id: variant.id,
        quantity: stock,
        low_stock_threshold: 10,
      }, { onConflict: "variant_id" });
    }

    console.log(`✓ Seeded: ${product.name}`);
  }
}
