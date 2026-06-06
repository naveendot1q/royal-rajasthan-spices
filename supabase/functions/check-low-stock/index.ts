import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendKey = Deno.env.get("RESEND_API_KEY")!;
const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@royalrajasthanspices.com";

Deno.serve(async (req) => {
  // Only allow POST with correct secret
  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${Deno.env.get("FUNCTION_SECRET")}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: lowStockItems } = await supabase
    .from("inventory")
    .select(`
      quantity, low_stock_threshold,
      variant:product_variants(id, name, sku, product:products(name))
    `)
    .lte("quantity", 10)
    .order("quantity");

  if (!lowStockItems || lowStockItems.length === 0) {
    return new Response(JSON.stringify({ message: "No low stock items" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const itemsHtml = lowStockItems.map((item) => {
    const variant = item.variant as { name: string; sku: string | null; product: { name: string } | null } | null;
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${variant?.product?.name || "Unknown"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${variant?.name || ""}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:${item.quantity === 0 ? "#dc2626" : "#d97706"};font-weight:bold">${item.quantity} ${item.quantity === 0 ? "(OUT)" : ""}</td>
    </tr>`;
  }).join("");

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "alerts@royalrajasthanspices.com",
      to: adminEmail,
      subject: `⚠️ Low Stock Alert — ${lowStockItems.length} items`,
      html: `<div style="font-family:sans-serif;max-width:600px">
        <h2 style="color:#6B1A1A">Low Stock Alert</h2>
        <p>${lowStockItems.length} items need restocking:</p>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#f9f9f9">
            <th style="padding:10px 12px;text-align:left;font-size:12px">Product</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px">Variant</th>
            <th style="padding:10px 12px;text-align:left;font-size:12px">Stock</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <a href="${Deno.env.get("NEXT_PUBLIC_ADMIN_URL")}/inventory"
          style="display:inline-block;margin-top:16px;background:#B8860B;color:white;padding:10px 20px;border-radius:6px;text-decoration:none">
          Manage Inventory →
        </a>
      </div>`,
    }),
  });

  return new Response(JSON.stringify({ sent: emailRes.ok, count: lowStockItems.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
