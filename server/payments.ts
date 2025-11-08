// Storage/payment helper module
// Provides helpers used by API routes. Adjust queries to your DB/query builder if needed.

import { db } from './db'; // adjust per your project
import { users, payments, subscriptions } from './db/schema'; // adjust per your schema definitions

export const paymentStorage = {
  // ----- Users -----
  async getUserByEmail(email: string) {
    return await db.select().from(users).where(users.email.eq(email)).limit(1);
  },

  async getUserById(id: string) {
    return await db.select().from(users).where(users.id.eq(id)).limit(1);
  },

  async createUser(payload: any) {
    // payload fields: email, role, emailVerified, needsPasswordSetup, firstName, lastName, createdAt
    return await db.insert(users).values({
      email: payload.email,
      role: payload.role ?? 'student',
      email_verified: payload.emailVerified ?? false,
      needs_password_setup: payload.needsPasswordSetup ?? false,
      first_name: payload.firstName ?? null,
      last_name: payload.lastName ?? null,
      created_at: payload.createdAt ?? new Date().toISOString(),
    }).returning();
  },

  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    return await db.update(users).set({ stripe_customer_id: stripeCustomerId }).where(users.id.eq(userId));
  },

  async linkSupabaseUser(userId: string, supabaseUserId: string | null) {
    return await db.update(users).set({ supabase_user_id: supabaseUserId }).where(users.id.eq(userId));
  },

  async updateUserPaidStatus(userId: string, data: { hasPaidAccess?: boolean; paidAt?: string }) {
    const updates: any = {};
    if (typeof data.hasPaidAccess !== 'undefined') updates.has_paid_access = data.hasPaidAccess;
    if (data.paidAt) updates.paid_at = data.paidAt;
    return await db.update(users).set(updates).where(users.id.eq(userId));
  },

  async setUserPasswordHash(userId: string, passwordHash: string) {
    return await db.update(users).set({ password_hash: passwordHash }).where(users.id.eq(userId));
  },

  // ----- Password setup token -----
  async savePasswordSetupToken(userId: string, token: string, expiresAt: string) {
    return await db.update(users).set({
      password_setup_token: token,
      password_setup_token_expires_at: expiresAt,
    }).where(users.id.eq(userId));
  },

  async findPasswordSetupByToken(token: string) {
    return await db.select().from(users).where(users.password_setup_token.eq(token)).limit(1);
  },

  async clearPasswordSetupToken(userId: string) {
    return await db.update(users).set({
      password_setup_token: null,
      password_setup_token_expires_at: null,
      needs_password_setup: false,
      email_verified: true,
    }).where(users.id.eq(userId));
  },

  // ----- Payments / Subscriptions -----
  async recordPayment(paymentData: any) {
    return await db.insert(payments).values(paymentData).returning();
  },

  async upsertSubscription(sub: any) {
    // simplistic upsert: try update where userId/planType matches, otherwise insert
    const existing = await db.select().from(subscriptions).where(subscriptions.userId.eq(sub.userId)).limit(1);
    if (existing && existing.length > 0) {
      return await db.update(subscriptions).set({
        status: sub.status,
        plan_type: sub.planType,
        stripe_subscription_id: sub.stripeSubscriptionId,
        current_period_start: sub.currentPeriodStart,
        current_period_end: sub.currentPeriodEnd,
        cancel_at_period_end: sub.cancelAtPeriodEnd ?? false,
      }).where(subscriptions.userId.eq(sub.userId));
    } else {
      return await db.insert(subscriptions).values({
        user_id: sub.userId,
        status: sub.status,
        plan_type: sub.planType,
        stripe_subscription_id: sub.stripeSubscriptionId,
        current_period_start: sub.currentPeriodStart,
        current_period_end: sub.currentPeriodEnd,
        cancel_at_period_end: sub.cancelAtPeriodEnd ?? false,
        created_at: new Date().toISOString(),
      }).returning();
    }
  },

  async getUserSubscription(userId: string) {
    return await db.select().from(subscriptions).where(subscriptions.userId.eq(userId)).limit(1);
  },

  async hasUserPaidAccess(userId: string) {
    const subs = await this.getUserSubscription(userId);
    return subs && subs.length > 0;
  },
};

export default paymentStorage;
