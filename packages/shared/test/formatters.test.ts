import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  slugify,
  calculateDiscount,
  calculateGST,
  formatWeight,
} from "../src/formatters";

describe("formatCurrency", () => {
  it("formats INR correctly", () => {
    const result = formatCurrency(1234.5);
    expect(result).toContain("1,234");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});

describe("slugify", () => {
  it("converts spaces to hyphens", () => {
    expect(slugify("Red Chilli Powder")).toBe("red-chilli-powder");
  });

  it("removes special characters", () => {
    expect(slugify("Premium Lal Mirch (100g)")).toBe("premium-lal-mirch-100g");
  });

  it("lowercases", () => {
    expect(slugify("ROYAL GARAM MASALA")).toBe("royal-garam-masala");
  });
});

describe("calculateDiscount", () => {
  it("calculates percentage discount correctly", () => {
    expect(calculateDiscount(189, 249)).toBe(24); // ~24%
  });

  it("returns 0 when no compare price", () => {
    expect(calculateDiscount(189, null)).toBe(0);
  });

  it("returns 0 when compare price <= base price", () => {
    expect(calculateDiscount(249, 189)).toBe(0);
  });
});

describe("calculateGST", () => {
  it("calculates 5% GST correctly", () => {
    const result = calculateGST(100);
    expect(result.gst).toBeCloseTo(5);
    expect(result.cgst).toBeCloseTo(2.5);
    expect(result.sgst).toBeCloseTo(2.5);
    expect(result.total).toBeCloseTo(105);
  });
});

describe("formatWeight", () => {
  it("formats grams", () => {
    expect(formatWeight(250)).toBe("250g");
  });

  it("formats kg", () => {
    expect(formatWeight(1000)).toBe("1kg");
    expect(formatWeight(500)).toBe("500g");
  });
});
