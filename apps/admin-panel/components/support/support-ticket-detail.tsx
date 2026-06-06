"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@rrs/shared";
import { Send, Lock, ChevronDown, CheckCircle } from "lucide-react";

type Message = {
  id: string; body: string; is_internal: boolean; created_at: string;
  sender: { full_name: string | null; avatar_url: string | null } | null;
};

type Ticket = {
  id: string; ticket_number: string; subject: string;
  status: string; priority: string; created_at: string;
  user: { id: string; full_name: string | null; phone: string | null } | null;
  order: { id: string; order_number: string; status: string; total: number } | null;
  messages: Message[];
};

interface SupportTicketDetailProps {
  ticket: Ticket;
  adminUserId: string;
}

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"];
const PRIORITY_OPTIONS = ["low", "medium", "high", "urgent"];

export function SupportTicketDetail({ ticket, adminUserId }: SupportTicketDetailProps) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    const supabase = createSupabaseClient();

    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: adminUserId,
      body: reply,
      is_internal: isInternal,
    });

    await supabase.from("support_tickets").update({
      status: status === "open" ? "in_progress" : status,
      updated_at: new Date().toISOString(),
    }).eq("id", ticket.id);

    setReply("");
    setSending(false);
    toast.success(isInternal ? "Internal note added" : "Reply sent to customer");
    router.refresh();
  };

  const updateTicket = async (updates: { status?: string; priority?: string }) => {
    const supabase = createSupabaseClient();
    await supabase.from("support_tickets").update(updates).eq("id", ticket.id);
    if (updates.status) setStatus(updates.status);
    if (updates.priority) setPriority(updates.priority);
    toast.success("Ticket updated");
    router.refresh();
  };

  const STATUS_COLORS: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-emerald-100 text-emerald-700",
    closed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Messages thread */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card-admin p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Conversation</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {ticket.messages
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.is_internal ? "opacity-75" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                    msg.is_internal ? "bg-purple-500" : "bg-royal-gold-600"
                  }`}>
                    {msg.sender?.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{msg.sender?.full_name || "Unknown"}</span>
                      {msg.is_internal && (
                        <span className="flex items-center gap-1 text-xs text-purple-600 font-medium">
                          <Lock size={10} /> Internal Note
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(msg.created_at, { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className={`rounded-xl p-3.5 text-sm leading-relaxed ${
                      msg.is_internal
                        ? "bg-purple-50 border border-purple-200 text-purple-800"
                        : "bg-gray-50 border border-gray-100 text-gray-700"
                    }`}>
                      {msg.body}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Reply box */}
        {status !== "closed" && (
          <div className="card-admin p-5">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-gray-900 text-sm">Reply</h3>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setIsInternal(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${!isInternal ? "bg-royal-gold-100 text-royal-gold-700" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  To Customer
                </button>
                <button
                  onClick={() => setIsInternal(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${isInternal ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  <Lock size={10} /> Internal Note
                </button>
              </div>
            </div>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              placeholder={isInternal ? "Add an internal note (only visible to staff)…" : "Type your reply to the customer…"}
              className={`input-admin resize-none mb-3 ${isInternal ? "border-purple-200 focus:ring-purple-400" : ""}`}
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim() || sending}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                isInternal ? "bg-purple-600 hover:bg-purple-700 text-white" : "btn-primary"
              }`}
            >
              <Send size={14} />
              {sending ? "Sending…" : isInternal ? "Add Note" : "Send Reply"}
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Ticket info */}
        <div className="card-admin p-5">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm">Ticket Details</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => updateTicket({ status: e.target.value })}
                  className={`input-admin text-xs appearance-none pr-8 font-medium ${STATUS_COLORS[status] || ""}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-white text-gray-800 font-normal">
                      {s.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-current pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => updateTicket({ priority: e.target.value })}
                className="input-admin text-xs capitalize"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {status !== "resolved" && status !== "closed" && (
            <button
              onClick={() => updateTicket({ status: "resolved" })}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <CheckCircle size={13} /> Mark Resolved
            </button>
          )}
        </div>

        {/* Customer info */}
        <div className="card-admin p-5">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Customer</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-royal-gold-400 to-maroon-600 flex items-center justify-center text-white text-sm font-bold">
              {ticket.user?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{ticket.user?.full_name || "Unknown"}</p>
              {ticket.user?.phone && <p className="text-xs text-gray-400">{ticket.user.phone}</p>}
            </div>
          </div>
          {ticket.user?.id && (
            <a href={`/customers/${ticket.user.id}`} className="text-xs text-royal-gold-600 hover:underline font-medium">
              View customer profile →
            </a>
          )}
        </div>

        {/* Order ref */}
        {ticket.order && (
          <div className="card-admin p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Related Order</h3>
            <a href={`/orders/${ticket.order.id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-royal-gold-50 transition-colors">
              <p className="text-xs font-mono text-gray-600">#{ticket.order.order_number}</p>
              <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{ticket.order.status.replace("_", " ")}</p>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
