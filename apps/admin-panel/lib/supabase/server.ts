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

  // Step 1: get role IDs for this user
  const { data: userRoleRows } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id);

  const roleIds = (userRoleRows ?? []).map((r: { role_id: string }) => r.role_id);
  if (roleIds.length === 0) return null;

  // Step 2: check if any role is admin-level
  const { data: adminRoles } = await supabase
    .from("roles")
    .select("name")
    .in("id", roleIds)
    .in("name", ["super_admin", "admin", "staff"]);

  if (!adminRoles || adminRoles.length === 0) return null;

  const roleName = adminRoles[0].name;
  return { ...user, role: roleName };
}
