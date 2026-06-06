import { createAdminSupabaseServer } from "@/lib/supabase/server";
import { CouponsTable } from "@/components/coupons/coupons-table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const supabase = await createAdminSupabaseServer();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">{coupons?.length} coupon codes</p>
        </div>
        <button className="btn-primary" id="create-coupon-btn">+ Create Coupon</button>
      </div>
      <CouponsTable coupons={coupons || []} />
    </div>
  );
}
