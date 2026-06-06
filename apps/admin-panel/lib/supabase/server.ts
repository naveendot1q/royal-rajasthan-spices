import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@rrs/database/types";

export async function createAdminSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
}

export async function getAdminUser() {
  const supabase = await createAdminSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Check staff role
  const { data: role } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", user.id)
    .single();

  const roleName = (role?.roles as { name: string } | null)?.name;
  if (!roleName || !["super_admin", "admin", "staff"].includes(roleName)) return null;

  return { ...user, role: roleName };
}
