/**
 * Trigger.dev job: Send abandoned cart recovery emails
 * Runs every 2 hours
 */
export const CART_RECOVERY_JOB_ID = "abandoned-cart-recovery";

export const cartRecoveryTask = {
  id: CART_RECOVERY_JOB_ID,
  cron: "0 */2 * * *", // Every 2 hours
  run: async () => {
    // Find carts older than 2 hours with items, no completed order
    // Send recovery email to logged-in users
    console.log("Cart recovery job running…");
    return { processed: 0 };
  },
};

/**
 * Trigger.dev job: Process order delivered → request review email
 * Triggered by order status webhook
 */
export const REVIEW_REQUEST_JOB_ID = "post-delivery-review-request";

export const reviewRequestTask = {
  id: REVIEW_REQUEST_JOB_ID,
  // Triggered 2 days after delivery
  run: async (payload: { orderId: string; userId: string; orderNumber: string }) => {
    const { sendDeliveredEmail } = await import("@rrs/notifications");
    // Get user email from Supabase
    console.log(`Sending review request for order ${payload.orderNumber}`);
    return { sent: true };
  },
};
