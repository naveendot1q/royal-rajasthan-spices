// SMS abstraction — entire app works if SMS_ENABLED=false
const SMS_ENABLED = process.env.SMS_ENABLED === "true";

interface SMSOptions {
  to: string;
  body: string;
}

export async function sendSMS(options: SMSOptions): Promise<{ success: boolean }> {
  if (!SMS_ENABLED) return { success: true }; // silent no-op

  try {
    // Twilio integration
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_PHONE!;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({ From: from, To: options.to, Body: options.body }),
      }
    );
    return { success: response.ok };
  } catch {
    console.error("SMS send failed (non-critical)");
    return { success: false };
  }
}

export async function sendOrderConfirmationSMS(phone: string, orderNumber: string) {
  return sendSMS({
    to: phone,
    body: `Royal Rajasthan Spices: Your order ${orderNumber} is confirmed! Track: ${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}`,
  });
}
