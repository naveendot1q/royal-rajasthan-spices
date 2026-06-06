import { MeiliSearch } from "meilisearch";

let client: MeiliSearch | null = null;

export function getMeilisearchClient(): MeiliSearch {
  if (!client) {
    client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || "http://localhost:7700",
      apiKey: process.env.MEILISEARCH_API_KEY || "masterKey",
    });
  }
  return client;
}

export const PRODUCTS_INDEX = "products";
