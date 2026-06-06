import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ id?: string; error?: string }> {
  try {
    const r = getResend();
    const { data, error } = await r.emails.send({
      from: options.from || process.env.EMAIL_FROM || "orders@royalrajasthanspices.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
    if (error) return { error: error.message };
    return { id: data?.id };
  } catch (err) {
    console.error("Email send error:", err);
    return { error: "Failed to send email" };
  }
}

// Pre-built email senders
export async function sendOrderConfirmationEmail(params: {
  to: string;
  orderNumber: string;
  customerName: string;
  total: number;
  items: Array<{ name: string; qty: number; price: number }>;
  deliveryAddress: string;
}) {
  const itemsHtml = params.items
    .map(i => `<tr><td>${i.name}</td><td>×${i.qty}</td><td>₹${i.price}</td></tr>`)
    .join("");

  return sendEmail({
    to: params.to,
    subject: `Order Confirmed — ${params.orderNumber} | Royal Rajasthan Spice Market`,
    html: `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', sans-serif; background: #FDF6E3; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; }
  .header { background: linear-gradient(135deg, #B8860B, #6B1A1A); padding: 32px; text-align: center; }
  .header h1 { color: #FDF6E3; margin: 0; font-size: 24px; }
  .header p { color: #DAA520; margin: 8px 0 0; }
  .body { padding: 32px; }
  .order-box { background: #FDF6E3; border: 1px solid #DAA520; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .order-number { font-size: 20px; font-weight: bold; color: #B8860B; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #F5E6C8; padding: 10px; text-align: left; color: #6B1A1A; }
  td { padding: 10px; border-bottom: 1px solid #F5E6C8; color: #333; }
  .total { font-size: 18px; font-weight: bold; color: #B8860B; text-align: right; }
  .footer { background: #6B1A1A; padding: 24px; text-align: center; color: #F5E6C8; font-size: 12px; }
  .btn { display: inline-block; background: #B8860B; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌶️ Royal Rajasthan Spice Market</h1>
      <p>Your order is confirmed!</p>
    </div>
    <div class="body">
      <p>Namaste ${params.customerName},</p>
      <p>Thank you for your order. We're preparing your spices with care.</p>
      <div class="order-box">
        <div class="order-number">Order #${params.orderNumber}</div>
      </div>
      <table>
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div class="total">Total: ₹${params.total}</div>
      <p><strong>Delivery to:</strong> ${params.deliveryAddress}</p>
      <center>
        <a class="btn" href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${params.orderNumber}">
          Track Your Order
        </a>
      </center>
    </div>
    <div class="footer">
      <p>Royal Rajasthan Spice Market | Authentic Flavors Since Tradition</p>
      <p>© ${new Date().getFullYear()} All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  });
}

export async function sendShippedEmail(params: {
  to: string;
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
}) {
  return sendEmail({
    to: params.to,
    subject: `Your order #${params.orderNumber} has shipped! 🚚`,
    html: `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', sans-serif; background: #FDF6E3; margin: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; }
  .header { background: linear-gradient(135deg, #1A3A5C, #B8860B); padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; }
  .body { padding: 32px; }
  .tracking-box { background: #EBF4FB; border: 2px solid #1A3A5C; border-radius: 8px; padding: 20px; text-align: center; }
  .tracking-number { font-size: 22px; font-weight: bold; color: #1A3A5C; font-family: monospace; }
  .btn { display: inline-block; background: #1A3A5C; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; margin: 16px 0; }
  .footer { background: #6B1A1A; padding: 24px; text-align: center; color: #F5E6C8; font-size: 12px; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>🚚 Your Order is on the Way!</h1></div>
    <div class="body">
      <p>Namaste ${params.customerName},</p>
      <p>Your order <strong>#${params.orderNumber}</strong> has been shipped!</p>
      <div class="tracking-box">
        <p style="color:#666; margin:0">Tracking Number</p>
        <div class="tracking-number">${params.trackingNumber}</div>
        <p style="color:#666">Carrier: ${params.carrier}</p>
        ${params.estimatedDelivery ? `<p>Expected delivery: <strong>${params.estimatedDelivery}</strong></p>` : ""}
      </div>
      <center>
        <a class="btn" href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${params.orderNumber}">
          Track Live
        </a>
      </center>
    </div>
    <div class="footer"><p>Royal Rajasthan Spice Market</p></div>
  </div>
</body>
</html>`,
  });
}

export async function sendDeliveredEmail(params: {
  to: string;
  orderNumber: string;
  customerName: string;
}) {
  return sendEmail({
    to: params.to,
    subject: `Order #${params.orderNumber} delivered! How was it? ⭐`,
    html: `
<!DOCTYPE html>
<html>
<head><style>
  body { font-family: 'Segoe UI', sans-serif; background: #FDF6E3; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; }
  .header { background: linear-gradient(135deg, #1A6B4A, #B8860B); padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; }
  .body { padding: 32px; text-align: center; }
  .btn-gold { display: inline-block; background: #B8860B; color: white; padding: 14px 36px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 8px; }
  .footer { background: #6B1A1A; padding: 24px; text-align: center; color: #F5E6C8; font-size: 12px; }
</style></head>
<body>
  <div class="container">
    <div class="header"><h1>✅ Delivered! Enjoy the Flavors!</h1></div>
    <div class="body">
      <p>Namaste ${params.customerName},</p>
      <p>Your order <strong>#${params.orderNumber}</strong> has been delivered!</p>
      <p>We hope you love the flavors of Royal Rajasthan. Share your experience!</p>
      <a class="btn-gold" href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${params.orderNumber}/review">
        ⭐ Write a Review
      </a>
    </div>
    <div class="footer"><p>Royal Rajasthan Spice Market</p></div>
  </div>
</body>
</html>`,
  });
}
