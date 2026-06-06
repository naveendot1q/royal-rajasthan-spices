import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createAdminSupabaseServer();
  const { data: settings } = await supabase
    .from("system_settings")
    .select("key, value, description");

  const settingsMap = (settings || []).reduce((acc, s) => ({
    ...acc,
    [s.key]: s.value,
  }), {} as Record<string, unknown>);

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="font-display text-2xl font-bold text-gray-900">Settings</h1>
      <SettingsForm settings={settingsMap} />
    </div>
  );
}
