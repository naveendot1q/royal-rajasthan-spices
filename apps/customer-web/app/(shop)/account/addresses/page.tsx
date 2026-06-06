import { redirect } from "next/navigation";
import { getUser, createSupabaseServer } from "@/lib/supabase/server";
import { AddressManager } from "@/components/account/address-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Addresses" };

export default async function AddressesPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServer();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("is_default", { ascending: false })
    .order("created_at");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-maroon-700 mb-6">My Addresses</h1>
      <AddressManager addresses={addresses || []} userId={user.id} />
    </div>
  );
}
