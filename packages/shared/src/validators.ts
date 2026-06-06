import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const pincodeSchema = z
  .string()
  .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode");

export const addressSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  line1: z.string().min(5, "Address must be at least 5 characters"),
  line2: z.string().optional(),
  city: z.string().min(2, "Enter a valid city"),
  state: z.string().min(2, "Select a state"),
  pincode: pincodeSchema,
  country: z.string().default("IN"),
  label: z.string().default("home"),
  is_default: z.boolean().default(false),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.number().positive(),
  min_order: z.number().min(0).default(0),
  max_discount: z.number().positive().optional(),
  max_uses: z.number().int().positive().optional(),
  user_limit: z.number().int().positive().default(1),
  expires_at: z.string().datetime().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
