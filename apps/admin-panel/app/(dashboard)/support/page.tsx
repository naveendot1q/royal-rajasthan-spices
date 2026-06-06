import { createAdminSupabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { formatRelativeTime } from "@rrs/shared";
import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = { title: "Support" };

interface SupportPageProps {
  searchParams: Promise<{ status?: string; priority?: string }>;
}

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const { status = "open", priority } = await searchParams;
  const supabase = await createAdminSupabaseServer();

  let query = supabase
    .from("support_tickets")
    .select(`
      id, ticket_number, subject, status, priority, created_at, updated_at,
      user:profiles(full_name, phone),
      order:orders(order_number),
      messages:support_messages(id)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (status !== "all") query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);

  const { data: tickets } = await query;

  const PRIORITY_COLORS: Record<string, string> = {
    low: "bg-gray-100 text-gray-600",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  const STATUS_COLORS: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">{tickets?.length} tickets</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
          <Link key={s} href={`/support?status=${s}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              status === s ? "bg-royal-gold-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {s.replace("_", " ")}
          </Link>
        ))}
        <div className="w-px bg-gray-200 mx-1" />
        {["urgent", "high", "medium"].map((p) => (
          <Link key={p} href={`/support?status=${status}&priority=${p}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              priority === p ? "bg-royal-gold-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {p}
          </Link>
        ))}
      </div>

      <div className="card-admin overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs text-gray-500">
              <th className="text-left px-5 py-3 font-medium">Ticket</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Priority</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-center px-5 py-3 font-medium">Messages</th>
              <th className="text-right px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(tickets || []).map((ticket) => {
              const user = ticket.user as { full_name: string | null; phone: string | null } | null;
              const order = ticket.order as { order_number: string } | null;
              const msgCount = (ticket.messages as { id: string }[])?.length || 0;

              return (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-mono text-xs text-gray-500">#{ticket.ticket_number}</div>
                    <div className="text-sm font-medium text-gray-800 mt-0.5 line-clamp-1">{ticket.subject}</div>
                    {order && <div className="text-xs text-royal-gold-600 mt-0.5">Order: #{order.order_number}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-gray-800">{user?.full_name || "—"}</div>
                    {user?.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${PRIORITY_COLORS[ticket.priority] || "bg-gray-100"}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[ticket.status] || "bg-gray-100"}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500">
                      <MessageSquare size={13} />
                      <span className="text-xs">{msgCount}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-xs text-gray-400">{formatRelativeTime(ticket.updated_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/support/${ticket.id}`} className="text-xs text-royal-gold-600 hover:underline font-medium">View</Link>
                  </td>
                </tr>
              );
            })}
            {(!tickets || tickets.length === 0) && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No tickets in this status</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
