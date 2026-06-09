import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  console.log("🌶  Seeding Royal Rajasthan Spice Market...\n");

  // ── Roles ──────────────────────────────────────────────────────────────────
  console.log("→ Roles");
  const { error: rolesErr } = await supabase.from("roles").upsert([
    { name: "super_admin", description: "Full access", permissions: { all: true } },
    { name: "admin",       description: "Admin access", permissions: { dashboard: true, products: true, orders: true, customers: true } },
    { name: "staff",       description: "Staff access", permissions: { orders: true, support: true } },
  ], { onConflict: "name" });
  if (rolesErr) console.error("  roles:", rolesErr.message);
  else console.log("  ✓ roles");

  // ── Shipping methods ───────────────────────────────────────────────────────
  console.log("→ Shipping methods");
  const { error: shippingErr } = await supabase.from("shipping_methods").upsert([
    { name: "Standard Delivery",  description: "5–7 business days", provider: "shiprocket", base_price: 60,  free_above: 499, estimated_days: 6, is_active: true, sort_order: 1 },
    { name: "Express Delivery",   description: "2–3 business days", provider: "shiprocket", base_price: 120, free_above: 999, estimated_days: 2, is_active: true, sort_order: 2 },
    { name: "Same Day Delivery",  description: "Within 24 hours (select cities)", provider: "manual", base_price: 200, free_above: null, estimated_days: 1, is_active: true, sort_order: 3 },
  ], { onConflict: "name" });
  if (shippingErr) console.error("  shipping:", shippingErr.message);
  else console.log("  ✓ shipping methods");

  // ── System settings ────────────────────────────────────────────────────────
  console.log("→ System settings");
  const settings = [
    { key: "store_name",         value: "Royal Rajasthan Spice Market" },
    { key: "store_email",        value: "hello@royalrajasthanspices.com" },
    { key: "store_phone",        value: "+91 98765 43210" },
    { key: "store_address",      value: "Jodhpur, Rajasthan, India" },
    { key: "gst_number",         value: "08AABCU9603R1ZN" },
    { key: "gst_rate",           value: 5 },
    { key: "free_shipping_above",value: 499 },
    { key: "cod_enabled",        value: true },
    { key: "min_order_value",    value: 99 },
    { key: "currency",           value: "INR" },
    { key: "meta_title",         value: "Royal Rajasthan Spice Market — Authentic Indian Spices" },
    { key: "meta_description",   value: "Premium Rajasthani spices sourced directly from farms. Free shipping above ₹499." },
  ];
  for (const s of settings) {
    const { error } = await supabase.from("system_settings").upsert(
      { key: s.key, value: s.value },
      { onConflict: "key" }
    );
    if (error) console.error(`  setting ${s.key}:`, error.message);
  }
  console.log("  ✓ system settings");

  // ── Categories ─────────────────────────────────────────────────────────────
  console.log("→ Categories");
  const categories = [
    { name: "Whole Spices",    slug: "whole-spices",    description: "Pure, unground spices for maximum aroma and flavour", image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400", sort_order: 1 },
    { name: "Ground Spices",   slug: "ground-spices",   description: "Freshly ground spices for convenience without compromise", image_url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400", sort_order: 2 },
    { name: "Spice Blends",    slug: "spice-blends",    description: "Royal secret masala blends from Rajasthan's palace kitchens", image_url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400", sort_order: 3 },
    { name: "Seeds & Pods",    slug: "seeds-pods",      description: "Aromatic seeds and pods for tempering and cooking", image_url: "https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=400", sort_order: 4 },
    { name: "Exotic & Rare",   slug: "exotic-rare",     description: "Hard-to-find spices from the remotest corners of Rajasthan", image_url: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400", sort_order: 5 },
    { name: "Gift Sets",       slug: "gift-sets",       description: "Curated spice collections — perfect for gifting", image_url: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400", sort_order: 6 },
  ];
  const { data: catData, error: catErr } = await supabase
    .from("product_categories")
    .upsert(categories.map(c => ({ ...c, is_active: true, meta: {} })), { onConflict: "slug" })
    .select("id, slug");
  if (catErr) { console.error("  categories:", catErr.message); return; }
  const catMap = Object.fromEntries(catData!.map(c => [c.slug, c.id]));
  console.log("  ✓ categories");

  // ── Products ───────────────────────────────────────────────────────────────
  console.log("→ Products");
  const products = [
    // Whole Spices
    { name: "Jodhpuri Black Cardamom", slug: "jodhpuri-black-cardamom", category_slug: "whole-spices", base_price: 249, compare_price: 320, description: "Smoky, camphor-like black cardamom pods sourced from high-altitude farms near Jodhpur. Essential for biryanis and curries.", origin: "Jodhpur, Rajasthan", is_featured: true, tags: ["cardamom", "whole", "biryani"], images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600"] },
    { name: "Pushkar Rose Petal Spice", slug: "pushkar-rose-petal-spice", category_slug: "whole-spices", base_price: 399, compare_price: 499, description: "Dried Pushkar rose petals — the world-famous Damask rose grown near the sacred Pushkar lake. Adds floral notes to sweets and chai.", origin: "Pushkar, Rajasthan", is_featured: true, tags: ["rose", "floral", "chai"], images: ["https://images.unsplash.com/photo-1559181567-c3190ca9d6f3?w=600"] },
    { name: "Rajasthani Cloves (Laung)", slug: "rajasthani-cloves", category_slug: "whole-spices", base_price: 189, compare_price: 240, description: "Plump, oil-rich cloves with intense flavour. Traditionally used in Rajasthani garam masala and chai.", origin: "Rajasthan", is_featured: false, tags: ["cloves", "whole", "chai"], images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600"] },
    { name: "Black Pepper Tellicherry Grade", slug: "black-pepper-tellicherry", category_slug: "whole-spices", base_price: 299, compare_price: 380, description: "Premium Tellicherry black pepper — larger berries, bolder flavour. The king of spices.", origin: "Rajasthan", is_featured: false, tags: ["pepper", "whole"], images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600"] },

    // Ground Spices
    { name: "Mathania Red Chilli Powder", slug: "mathania-red-chilli-powder", category_slug: "ground-spices", base_price: 149, compare_price: 199, description: "The legendary Mathania chilli — prized for its deep red colour and moderate heat. The secret behind Laal Maas.", origin: "Mathania, Rajasthan", is_featured: true, tags: ["chilli", "red", "mathania", "laal maas"], images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600"] },
    { name: "Turmeric (Lakadong Grade)", slug: "turmeric-lakadong", category_slug: "ground-spices", base_price: 179, compare_price: 220, description: "High-curcumin Lakadong turmeric — 7–12% curcumin content vs 2–3% in regular turmeric. Vivid golden colour.", origin: "Rajasthan", is_featured: true, tags: ["turmeric", "haldi", "health"], images: ["https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=600"] },
    { name: "Cumin Powder (Jeera)", slug: "cumin-powder-jeera", category_slug: "ground-spices", base_price: 129, compare_price: 160, description: "Freshly ground cumin from the Rajasthani desert — known for its earthy, warm aroma.", origin: "Nagaur, Rajasthan", is_featured: false, tags: ["cumin", "jeera", "ground"], images: ["https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600"] },
    { name: "Coriander Powder (Dhaniya)", slug: "coriander-powder-dhaniya", category_slug: "ground-spices", base_price: 99, compare_price: 130, description: "Sweet, citrusy coriander powder — the base of almost every Rajasthani curry.", origin: "Rajasthan", is_featured: false, tags: ["coriander", "dhaniya", "ground"], images: ["https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600"] },

    // Spice Blends
    { name: "Royal Garam Masala", slug: "royal-garam-masala", category_slug: "spice-blends", base_price: 219, compare_price: 280, description: "A 12-spice royal blend from the palace kitchens of Jaipur. No fillers, no additives — just pure spice.", origin: "Jaipur, Rajasthan", is_featured: true, tags: ["garam masala", "blend", "royal"], images: ["https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600"] },
    { name: "Laal Maas Masala", slug: "laal-maas-masala", category_slug: "spice-blends", base_price: 249, compare_price: 320, description: "The authentic blend for Rajasthan's most iconic dish — fiery Laal Maas. Made with Mathania chillies.", origin: "Rajasthan", is_featured: true, tags: ["laal maas", "blend", "mutton"], images: ["https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600"] },
    { name: "Dal Baati Churma Masala", slug: "dal-baati-churma-masala", category_slug: "spice-blends", base_price: 189, compare_price: 240, description: "Traditional spice blend for Rajasthan's beloved Dal Baati. Perfectly balanced for the authentic taste.", origin: "Rajasthan", is_featured: false, tags: ["dal baati", "blend", "traditional"], images: ["https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600"] },
    { name: "Rajasthani Chai Masala", slug: "rajasthani-chai-masala", category_slug: "spice-blends", base_price: 169, compare_price: 210, description: "A warming chai blend with cardamom, ginger, cinnamon, and Pushkar rose petals. Makes 60–80 cups.", origin: "Rajasthan", is_featured: true, tags: ["chai", "tea", "blend"], images: ["https://images.unsplash.com/photo-1559181567-c3190ca9d6f3?w=600"] },

    // Seeds & Pods
    { name: "Ajwain (Carom Seeds)", slug: "ajwain-carom-seeds", category_slug: "seeds-pods", base_price: 119, compare_price: 150, description: "Pungent, thyme-like carom seeds from Rajasthan. Essential for tempering flatbreads and lentil dishes.", origin: "Rajasthan", is_featured: false, tags: ["ajwain", "carom", "seeds"], images: ["https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=600"] },
    { name: "Fenugreek Seeds (Methi Dana)", slug: "fenugreek-seeds-methi-dana", category_slug: "seeds-pods", base_price: 89, compare_price: 120, description: "Slightly bitter fenugreek seeds — essential for pickles, curry bases, and hair care.", origin: "Rajasthan", is_featured: false, tags: ["methi", "fenugreek", "seeds"], images: ["https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=600"] },

    // Exotic & Rare
    { name: "Kesar (Saffron) — 1g", slug: "kesar-saffron-1g", category_slug: "exotic-rare", base_price: 599, compare_price: 750, description: "Pure A-grade saffron threads. Deep red stigmas with intense colour and aroma. Perfect for biryani, kheer, and sweets.", origin: "Rajasthan", is_featured: true, tags: ["saffron", "kesar", "exotic", "premium"], images: ["https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600"] },
    { name: "Kala Namak (Black Salt)", slug: "kala-namak-black-salt", category_slug: "exotic-rare", base_price: 129, compare_price: 160, description: "Volcanic black salt with distinctive sulphuric aroma. Essential for chaat, raita, and Ayurvedic cooking.", origin: "Rajasthan", is_featured: false, tags: ["black salt", "kala namak", "chaat"], images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600"] },
  ];

  for (const p of products) {
    const { images, category_slug, ...productData } = p;
    const { data: prod, error: prodErr } = await supabase
      .from("products")
      .upsert({
        ...productData,
        category_id: catMap[category_slug],
        status: "active",
        nutritional_info: {},
        meta: {},
        tags: p.tags,
      }, { onConflict: "slug" })
      .select("id")
      .single();

    if (prodErr) { console.error(`  product ${p.slug}:`, prodErr.message); continue; }

    // Product image
    await supabase.from("product_images").upsert({
      product_id: prod!.id,
      url: images[0],
      alt_text: p.name,
      is_primary: true,
      sort_order: 1,
    }, { onConflict: "product_id,url" });

    // Variants
    const variants = [
      { name: "50g",  price_modifier: 0,   weight_grams: 50,  sort_order: 1 },
      { name: "100g", price_modifier: Math.round(p.base_price * 0.8),  weight_grams: 100, sort_order: 2 },
      { name: "250g", price_modifier: Math.round(p.base_price * 1.8),  weight_grams: 250, sort_order: 3 },
    ];

    for (const v of variants) {
      const { data: variant, error: varErr } = await supabase
        .from("product_variants")
        .upsert({
          product_id: prod!.id,
          name: v.name,
          sku: `${p.slug.toUpperCase().slice(0, 8)}-${v.name}`,
          price_modifier: v.price_modifier,
          weight_grams: v.weight_grams,
          is_active: true,
          sort_order: v.sort_order,
        }, { onConflict: "product_id,name" })
        .select("id")
        .single();

      if (varErr) { console.error(`  variant ${p.slug} ${v.name}:`, varErr.message); continue; }

      // Inventory
      await supabase.from("inventory").upsert({
        variant_id: variant!.id,
        quantity: Math.floor(Math.random() * 150) + 50,
        reserved_qty: 0,
        low_stock_threshold: 10,
      }, { onConflict: "variant_id" });
    }
  }
  console.log(`  ✓ ${products.length} products with variants and inventory`);

  // ── Coupons ────────────────────────────────────────────────────────────────
  console.log("→ Coupons");
  const { error: couponErr } = await supabase.from("coupons").upsert([
    { code: "WELCOME10",  type: "percentage", value: 10, min_order: 199, max_discount: 100, max_uses: 1000, is_active: true },
    { code: "ROYAL20",    type: "percentage", value: 20, min_order: 499, max_discount: 200, max_uses: 500,  is_active: true },
    { code: "FLAT50",     type: "fixed",      value: 50, min_order: 299, max_discount: null, max_uses: null, is_active: true },
    { code: "FREESHIP",   type: "fixed",      value: 60, min_order: 199, max_discount: 60,  max_uses: 200,  is_active: true },
  ], { onConflict: "code" });
  if (couponErr) console.error("  coupons:", couponErr.message);
  else console.log("  ✓ coupons");

  // ── Banners ────────────────────────────────────────────────────────────────
  console.log("→ Banners");
  const { error: bannerErr } = await supabase.from("banners").upsert([
    { title: "Welcome to Royal Rajasthan", subtitle: "Authentic spices from the palace kitchens", image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1400", link: "/products", cta_text: "Shop Now", position: "hero", sort_order: 1, is_active: true },
    { title: "Free Shipping Above ₹499",   subtitle: "On all orders across India", image_url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=1400", link: "/products", cta_text: "Order Now", position: "hero", sort_order: 2, is_active: true },
    { title: "New: Kesar Saffron In Stock", subtitle: "A-grade saffron threads — limited stock", image_url: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=1400", link: "/products/kesar-saffron-1g", cta_text: "Buy Now", position: "hero", sort_order: 3, is_active: true },
  ], { onConflict: "title" });
  if (bannerErr) console.error("  banners:", bannerErr.message);
  else console.log("  ✓ banners");

  // ── CMS Pages ──────────────────────────────────────────────────────────────
  console.log("→ CMS Pages");
  const pages = [
    { slug: "about-us",       title: "About Us",        body: "<h1>Our Story</h1><p>Royal Rajasthan Spice Market was founded with one mission — to bring the authentic flavours of Rajasthan's royal kitchens to homes across India.</p>", is_active: true },
    { slug: "quality-promise",title: "Quality Promise", body: "<h1>Our Quality Promise</h1><p>Every batch is lab-tested for purity. No additives, no artificial colours, no adulterants — ever.</p>", is_active: true },
    { slug: "shipping-policy",title: "Shipping Policy", body: "<h1>Shipping Policy</h1><p>Free shipping on orders above ₹499. Standard delivery in 5–7 business days. Express delivery available.</p>", is_active: true },
    { slug: "return-policy",  title: "Return Policy",   body: "<h1>Return Policy</h1><p>We offer a 7-day return policy on all products. If you're not satisfied, contact us and we'll make it right.</p>", is_active: true },
    { slug: "privacy-policy", title: "Privacy Policy",  body: "<h1>Privacy Policy</h1><p>We respect your privacy and never share your data with third parties.</p>", is_active: true },
  ];
  for (const page of pages) {
    const { error } = await supabase.from("cms_pages").upsert({ ...page, meta: {} }, { onConflict: "slug" });
    if (error) console.error(`  page ${page.slug}:`, error.message);
  }
  console.log("  ✓ cms pages");

  console.log("\n✅ Seed complete!");
  console.log("\nNext steps:");
  console.log("  1. Run: supabase db push  (if not done yet)");
  console.log("  2. Sign up at your admin panel URL");
  console.log("  3. Run the SQL in Supabase dashboard to grant yourself super_admin role");
  console.log("  4. Sync Meilisearch: POST /api/products/sync");
}

seed().catch(console.error);
