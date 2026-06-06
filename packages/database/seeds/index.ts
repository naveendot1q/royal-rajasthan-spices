import { seedCategories } from "./01_categories";
import { seedProducts } from "./02_products";

async function runSeeds() {
  console.log("\n🌶 Royal Rajasthan Spices — Database Seed");
  console.log("==========================================\n");

  try {
    console.log("Seeding categories...");
    await seedCategories();

    console.log("\nSeeding products...");
    await seedProducts();

    console.log("\n✅ Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

runSeeds();
