import { redirect } from "next/navigation";
import { getUser, createSupabaseServer } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/account/profile");

  const supabase = await createSupabaseServer();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-maroon-700 mb-6">My Profile</h1>
      <ProfileForm profile={profile} email={user.email || ""} />
    </div>
  );
}
