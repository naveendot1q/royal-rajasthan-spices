"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Plus, ChevronRight, Clock } from "lucide-react";
import { formatRelativeTime } from "@rrs/shared";

type Ticket = {
  id: string; ticket_number: string; subject: string;
  status: string; priority: string; created_at: string; updated_at: string;
  order: { order_number: string } | null;
  messages: { id: string }[];
};

interface SupportTicketsProps {
  tickets: Ticket[];
  userId: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-600",
};

export function SupportTickets({ tickets, userId }: SupportTicketsProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "", priority: "medium" });
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.body.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    const supabase = createSupabaseClient();

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        ticket_number: ticketNumber,
        subject: form.subject,
        status: "open",
        priority: form.priority,
      })
      .select()
      .single();

    if (error) { toast.error("Failed to create ticket"); setSubmitting(false); return; }

    // Add first message
    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId,
      body: form.body,
    });

    toast.success("Support ticket created! We'll get back to you soon.");
    setShowForm(false);
    setForm({ subject: "", body: "", priority: "medium" });
    router.refresh();
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create New Ticket
        </button>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl border border-royal-gold-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Support Request</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input-royal"
                placeholder="e.g. Wrong item delivered, refund request…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="input-royal"
              >
                <option value="low">Low — General inquiry</option>
                <option value="medium">Medium — Need assistance</option>
                <option value="high">High — Urgent issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Describe your issue *</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={5}
                className="input-royal resize-none"
                placeholder="Please describe the issue in detail, including order number if relevant…"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={submitting} className="btn-primary disabled:opacity-50">
                {submitting ? "Submitting…" : "Submit Ticket"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {tickets.length === 0 && !showForm ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-royal-gold-100">
          <MessageSquare size={40} className="mx-auto text-royal-gold-200 mb-4" />
          <h2 className="font-display text-xl text-maroon-600 mb-2">No support tickets</h2>
          <p className="text-gray-500 mb-6">Need help? Create a ticket and our team will respond soon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-2xl border border-royal-gold-100 p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs text-gray-400">#{ticket.ticket_number}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status] || "bg-gray-100 text-gray-600"}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{ticket.priority} priority</span>
                </div>
                <p className="font-medium text-gray-800 text-sm truncate">{ticket.subject}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={11} /> {formatRelativeTime(ticket.updated_at)}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11} /> {ticket.messages.length} messages</span>
                  {ticket.order && <span>Order #{ticket.order.order_number}</span>}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
