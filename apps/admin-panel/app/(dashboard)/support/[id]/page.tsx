import { createAdminSupabaseServer, getAdminUser } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatDate } from "@rrs/shared";
import { SupportTicketDetail } from "@/components/support/support-ticket-detail";
import type { Metadata } from "next";

interface SupportDetailPageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Support Ticket" };

export default async function SupportDetailPage({ params }: SupportDetailPageProps) {
  const { id } = await params;
  const supabase = await createAdminSupabaseServer();
  const adminUser = await getAdminUser();

  const { data: ticket } = await supabase
    .from("support_tickets")
    .select(`
      *, user:profiles(id, full_name, phone),
      order:orders(id, order_number, status, total),
      messages:support_messages(*, sender:profiles(full_name, avatar_url))
    `)
    .eq("id", id)
    .single();

  if (!ticket) notFound();

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <a href="/support" className="text-gray-400 hover:text-gray-600 text-sm">← Support</a>
            <span className="text-gray-300">/</span>
            <span className="font-mono text-sm text-gray-600">#{ticket.ticket_number}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mt-1">{ticket.subject}</h1>
        </div>
      </div>
      <SupportTicketDetail
        ticket={ticket as Parameters<typeof SupportTicketDetail>[0]["ticket"]}
        adminUserId={adminUser!.id}
      />
    </div>
  );
}
