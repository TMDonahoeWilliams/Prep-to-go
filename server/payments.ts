// Stripe server-side configuration
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY environment variable is not set');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    console.log('Initializing Stripe with key:', process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...');
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia' as any,
    });
  }
  return stripeInstance;
}

// Export a proxy object that lazily initializes Stripe
const stripeProxy = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const stripe = getStripe();
    return (stripe as any)[prop];
  }
});

export default stripeProxy;

// Payment-related storage functions
import { db } from './db';
import { subscriptions, payments, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export const paymentStorage = {
  // Create or update subscription
  // Adjusted: choose on-conflict target dynamically:
  // - if stripeSubscriptionId is provided, keep existing behavior (conflict on stripeSubscriptionId)
  // - if stripeSubscriptionId is null/undefined (one-time / lifetime purchases), conflict on (userId, planType)
  async upsertSubscription(subscriptionData: typeof subscriptions.$inferInsert) {
    // Determine conflict target: if we have a stripeSubscriptionId, use it.
    // For one-time purchases where stripeSubscriptionId may be null, use (userId, planType) as the conflict target.
    // NOTE: Postgres requires a unique constraint/index on the conflict target; ensure a unique index exists on (user_id, plan_type).
    const conflictTarget = subscriptionData.stripeSubscriptionId
      ? subscriptions.stripeSubscriptionId
      : [subscriptions.userId, subscriptions.planType];

    return await db
      .insert(subscriptions)
      .values(subscriptionData)
      .onConflictDoUpdate({
        target: conflictTarget,
        set: {
          status: subscriptionData.status,
          currentPeriodStart: subscriptionData.currentPeriodStart,
          currentPeriodEnd: subscriptionData.currentPeriodEnd,
          cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
          updatedAt: new Date(),
        },
      })
      .returning();
  },

  // Get user's active subscription
  async getUserSubscription(userId: string) {
    return await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        )
      )
      .limit(1);
  },

  // Check if user has paid access
  async hasUserPaidAccess(userId: string) {
    const userSubs = await this.getUserSubscription(userId);
    return userSubs.length > 0;
  },

  // Record payment
  async recordPayment(paymentData: typeof payments.$inferInsert) {
    return await db
      .insert(payments)
      .values(paymentData)
      .returning();
  },

  // Get user by email
  async getUserByEmail(email: string) {
    return await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
  },

  // Update user's Stripe customer ID
  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    // Add stripeCustomerId to users table if it doesn't exist
    // For now, we'll store it in the subscription record
    return true;
  }
};
