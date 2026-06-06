"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@rrs/database/types";

export function createAdminSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Also export as createSupabaseClient for compatibility
export const createSupabaseClient = createAdminSupabaseClient;
