import { getMeilisearchClient, PRODUCTS_INDEX } from "./client";
import { PRODUCTS_INDEX_SETTINGS } from "./config";
import type { SearchProduct } from "@rrs/types";

export async function setupProductsIndex(): Promise<void> {
  const client = getMeilisearchClient();
  const index = client.index(PRODUCTS_INDEX);
  await index.updateSettings(PRODUCTS_INDEX_SETTINGS);
  console.log("Meilisearch products index configured ✓");
}

export async function indexProducts(products: SearchProduct[]): Promise<void> {
  const client = getMeilisearchClient();
  const index = client.index(PRODUCTS_INDEX);
  const task = await index.addDocuments(products, { primaryKey: "id" });
  console.log(`Indexed ${products.length} products, task: ${task.taskUid}`);
}

export async function updateProduct(product: SearchProduct): Promise<void> {
  const client = getMeilisearchClient();
  const index = client.index(PRODUCTS_INDEX);
  await index.updateDocuments([product]);
}

export async function deleteProduct(productId: string): Promise<void> {
  const client = getMeilisearchClient();
  const index = client.index(PRODUCTS_INDEX);
  await index.deleteDocument(productId);
}

export async function searchProducts(
  query: string,
  options: {
    page?: number;
    hitsPerPage?: number;
    filter?: string[];
    sort?: string[];
    facets?: string[];
  } = {}
) {
  const client = getMeilisearchClient();
  const index = client.index(PRODUCTS_INDEX);
  return index.search(query, {
    page: options.page || 1,
    hitsPerPage: options.hitsPerPage || 24,
    filter: options.filter,
    sort: options.sort,
    facets: options.facets || ["category_name", "tags", "origin"],
    attributesToHighlight: ["name", "description"],
    highlightPreTag: '<mark class="search-highlight">',
    highlightPostTag: "</mark>",
  });
}

export async function autocomplete(query: string, limit = 5) {
  const client = getMeilisearchClient();
  const index = client.index(PRODUCTS_INDEX);
  return index.search(query, {
    limit,
    attributesToRetrieve: ["id", "name", "slug", "primary_image", "base_price", "category_name"],
    attributesToHighlight: ["name"],
    highlightPreTag: "<strong>",
    highlightPostTag: "</strong>",
  });
}
