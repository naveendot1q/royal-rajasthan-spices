import type { Settings } from "meilisearch";

export const PRODUCTS_INDEX_SETTINGS: Settings = {
  filterableAttributes: [
    "category_id",
    "category_name",
    "tags",
    "origin",
    "is_featured",
    "has_stock",
    "avg_rating",
    "price_range",
  ],
  sortableAttributes: [
    "base_price",
    "avg_rating",
    "sales_count",
    "created_at",
    "review_count",
  ],
  searchableAttributes: [
    "name",
    "description",
    "tags",
    "origin",
    "sku",
    "category_name",
  ],
  rankingRules: [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness",
    "sales_count:desc",
  ],
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
  },
  pagination: { maxTotalHits: 1000 },
  faceting: { maxValuesPerFacet: 50 },
};
