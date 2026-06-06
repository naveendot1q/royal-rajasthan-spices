/**
 * Run: pnpm tsx scripts/setup-meilisearch.ts
 */
import { getMeilisearchClient, PRODUCTS_INDEX } from "../packages/search/src/client";
import { PRODUCTS_INDEX_SETTINGS } from "../packages/search/src/config";

async function main() {
  console.log("\n🔍 Setting up Meilisearch index...");
  const client = getMeilisearchClient();

  try {
    await client.health();
    console.log("✅ Meilisearch is reachable");
  } catch {
    console.error("❌ Cannot reach Meilisearch — is it running?");
    console.error("   docker-compose -f docker-compose.dev.yml up -d meilisearch");
    process.exit(1);
  }

  const index = client.index(PRODUCTS_INDEX);
  const { taskUid } = await index.updateSettings(PRODUCTS_INDEX_SETTINGS);
  await client.waitForTask(taskUid);
  const stats = await index.getStats();

  console.log("✅ Index configured");
  console.log(`📊 Documents in index: ${stats.numberOfDocuments}`);
  console.log("   Sync products: POST http://localhost:3001/api/products/sync");
}

main().catch(console.error);
