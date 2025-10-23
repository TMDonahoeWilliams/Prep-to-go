// Stripe server-side configuration
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

export default stripe;

// Payment-related storage functions
import { db } from './db';
import { subscriptions, payments, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export const paymentStorage = {
  // Create or update subscription
  async upsertSubscription(subscriptionData: typeof subscriptions.$inferInsert) {
    return await db
      .insert(subscriptions)
      .values(subscriptionData)
      .onConflictDoUpdate({
        target: subscriptions.stripeSubscriptionId,
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