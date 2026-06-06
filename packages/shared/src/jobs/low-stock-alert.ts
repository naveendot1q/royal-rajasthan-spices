/**
 * Trigger.dev job: Send low-stock email alerts to admin
 * Runs daily via cron schedule
 * 
 * To register: import this in your Trigger.dev project entry
 */
export const LOW_STOCK_JOB_ID = "low-stock-alert";

export interface LowStockJobPayload {
  items: Array<{
    productName: string;
    variantName: string;
    quantity: number;
    threshold: number;
    sku: string | null;
  }>;
}

// Trigger.dev task definition (register in your trigger.ts entry point)
export const lowStockAlertTask = {
  id: LOW_STOCK_JOB_ID,
  cron: "0 7 * * *", // 7 AM UTC daily (12:30 PM IST)
  run: async (payload: LowStockJobPayload, { ctx }: { ctx: unknown }) => {
    const { sendEmail } = await import("@rrs/notifications");

    const itemsHtml = payload.items
      .map((item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.productName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.variantName}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:${item.quantity === 0 ? "#dc2626" : "#d97706"};font-weight:bold">
            ${item.quantity} ${item.quantity === 0 ? "(OUT)" : ""}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.threshold}</td>
        </tr>
      `)
      .join("");

    await sendEmail({
      to: process.env.ADMIN_EMAIL || "admin@royalrajasthanspices.com",
      subject: `⚠️ Low Stock Alert — ${payload.items.length} item${payload.items.length > 1 ? "s" : ""} need restocking`,
      html: `
        <div style="font-family:sans-serif;max-width:600px">
          <div style="background:#6B1A1A;padding:24px;border-radius:8px 8px 0 0">
            <h1 style="color:#DAA520;margin:0;font-size:20px">⚠️ Low Stock Alert</h1>
            <p style="color:#f5e6c8;margin:8px 0 0;font-size:14px">Royal Rajasthan Spice Market</p>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
            <p style="color:#374151">${payload.items.length} items need restocking:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280">Product</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280">Variant</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280">Stock</th>
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280">Threshold</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>
            <a href="${process.env.NEXT_PUBLIC_ADMIN_URL}/inventory"
              style="display:inline-block;background:#B8860B;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
              Manage Inventory →
            </a>
          </div>
        </div>
      `,
    });

    return { sent: true, itemCount: payload.items.length };
  },
};
