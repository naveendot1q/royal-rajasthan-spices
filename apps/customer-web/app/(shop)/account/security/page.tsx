import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SecuritySettings } from "@/components/account/security-settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Security Settings" };

export default async function SecurityPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-maroon-700 mb-6">Security Settings</h1>
      <SecuritySettings email={user.email || ""} />
    </div>
  );
}
