import { redirect } from "next/navigation";
import { getUser, createSupabaseServer } from "@/lib/supabase/server";
import { AccountSidebar } from "@/components/account/account-sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/account");

  const supabase = await createSupabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, loyalty_pts")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-palace-ivory">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AccountSidebar
              email={user.email || ""}
              fullName={profile?.full_name || null}
              loyaltyPts={profile?.loyalty_pts || 0}
            />
          </aside>
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
