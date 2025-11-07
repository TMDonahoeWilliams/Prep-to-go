// api/payments/confirm-payment.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    // dynamic import so runtime resolves .js on Vercel
    let paymentsModule: any;
    try {
      paymentsModule = await import("../../server/payments.js");
    } catch (err) {
      paymentsModule = await import("../../server/payments");
    }
    const { paymentStorage } = paymentsModule;

    const { paymentIntentId, userEmail } = req.body || {};
    if (!paymentIntentId) return res.status(400).json({ message: "paymentIntentId required" });

    // Example: find user and mark payment/subscription
    const users = await paymentStorage.getUserByEmail(userEmail);
    const user = users && users[0];

    await paymentStorage.recordPayment({
      userId: user?.id ?? null,
      stripePaymentIntentId: paymentIntentId,
      amount: req.body.amount ?? 0,
      currency: req.body.currency ?? "usd",
      status: "succeeded",
      description: req.body.description ?? "Payment confirmation",
    });

    await paymentStorage.upsertSubscription({
      userId: user?.id ?? null,
      planType: "basic",
      status: "active",
      stripeSubscriptionId: null,
      currentPeriodStart: new Date(),
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("confirm-payment error:", err);
    // Always return JSON for API errors — do NOT redirect
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
