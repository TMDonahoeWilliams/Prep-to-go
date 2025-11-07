// NOTE: Replace the existing file with this content or merge the changes into the existing file.
// This preserves Stripe verification but adds persistence to the DB via server/paymentStorage.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { z } from "zod";

// Import the server-side payment storage helpers
// relative path from api/payments/confirm-payment.ts to server/payments.ts
import { paymentStorage } from "../../server/payments";

const bodySchema = z.object({
  paymentIntentId: z.string().min(1),
  userEmail: z.string().email(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS for demo / dev usage
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const validationResult = bodySchema.safeParse(req.body);
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error);
      return res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { paymentIntentId, userEmail } = validationResult.data;

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY not configured");
      return res.status(500).json({ message: "Payment system not configured" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia" as any,
    });

    console.log(`Confirming payment for ${userEmail} with intent ${paymentIntentId}`);

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["charges.data.balance_transaction"],
    });

    if (!paymentIntent) {
      console.error("Payment intent not found:", paymentIntentId);
      return res.status(404).json({ message: "Payment intent not found" });
    }

    // Only accept succeeded intents for immediate access
    const succeeded = paymentIntent.status === "succeeded" || paymentIntent.status === "requires_capture";
    if (!succeeded) {
      console.warn("Payment intent not in succeeded state:", paymentIntent.status);
      return res.status(400).json({ message: "Payment not completed", status: paymentIntent.status });
    }

    // Build the confirmation object returned to the client (keep existing shape)
    const confirmation = {
      success: true,
      message: "Payment confirmed",
      confirmedAt: new Date().toISOString(),
      accessGranted: true,
      subscription: {
        status: "active",
        planType: "basic",
        expiresAt: null,
      },
      stripeData: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        receiptEmail: paymentIntent.receipt_email,
        created: paymentIntent.created,
      },
    };

    // === Persist to DB so server-side checks see the subscription/payment ===
    let dbSubscription = null;
    let dbPayment = null;

    try {
      // 1) Find the user
      const users = await paymentStorage.getUserByEmail(userEmail);
      if (!users || users.length === 0) {
        console.error("User lookup failed for email:", userEmail);
        return res.status(400).json({ message: "User not found for provided email" });
      }
      const user = users[0];
      const userId = user.id;
      console.log("Found user for payment confirmation:", userId, userEmail);

      // 2) Upsert subscription (one-time purchase -> lifetime active subscription)
      const subscriptionData = {
        // depending on your schema, stripeSubscriptionId can be null/empty for one-time payments
        stripeSubscriptionId: null,
        userId,
        planType: "basic",
        status: "active",
        currentPeriodStart: new Date(),
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any; // typed as any because server schema helper will expect the insert shape

      console.log("Upserting subscription for user:", userId);
      const upserted = await paymentStorage.upsertSubscription(subscriptionData);
      // upsertSubscription returns a returning() result - use the first row
      dbSubscription = Array.isArray(upserted) ? upserted[0] : upserted;
      console.log("Subscription upsert result:", dbSubscription?.id || dbSubscription);

      // 3) Record payment row pointing at the subscription
      const paymentRecord = {
        userId,
        subscriptionId: dbSubscription?.id ?? null,
        stripePaymentIntentId: paymentIntent.id,
        // If your payments schema has amount/currency fields, include them. If not, they will be ignored/validated by DB layer.
        amount: paymentIntent.amount ?? null,
        currency: paymentIntent.currency ?? null,
        createdAt: new Date(),
      } as any;

      console.log("Recording payment for user:", userId, "intent:", paymentIntent.id);
      const recorded = await paymentStorage.recordPayment(paymentRecord);
      dbPayment = Array.isArray(recorded) ? recorded[0] : recorded;
      console.log("Payment record result:", dbPayment?.id || dbPayment);
    } catch (dbError: any) {
      console.error("Database persistence error during payment confirmation:", dbError);
      return res.status(500).json({
        success: false,
        message: "Payment confirmed with Stripe but failed to persist subscription/payment records",
        error: process.env.NODE_ENV === "development" ? dbError.stack || dbError.message : undefined,
      });
    }

    // Include DB results in response to caller
    return res.status(200).json({
      ...confirmation,
      dbSubscription,
      dbPayment,
    });
  } catch (error: any) {
    console.error("Payment confirmation error:", error);

    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment intent ID",
      });
    }

    if (error.type === "StripeAPIError") {
      return res.status(500).json({
        success: false,
        message: "Stripe API error",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm payment",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
