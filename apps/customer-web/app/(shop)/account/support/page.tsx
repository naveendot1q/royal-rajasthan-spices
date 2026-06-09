import { redirect } from "next/navigation";
import { getUser, createSupabaseServer } from "@/lib/supabase/server";
import { SupportTickets } from "@/components/account/support-tickets";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support" };

type SupportTicket = {
  id: string; ticket_number: string; subject: string; status: string;
  priority: string; created_at: string; updated_at: string;
  order: { order_number: string } | null;
  messages: { id: string }[];
};

export default async function SupportPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServer();
  const { data: rawTickets } = await supabase
    .from("support_tickets")
    .select(`
      id, ticket_number, subject, status, priority, created_at, updated_at,
      order:orders(order_number),
      messages:support_messages(id)
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const tickets = (rawTickets ?? []) as unknown as SupportTicket[];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-maroon-700 mb-6">My Support Tickets</h1>
      <SupportTickets tickets={tickets} userId={user.id} />
    </div>
  );
}
