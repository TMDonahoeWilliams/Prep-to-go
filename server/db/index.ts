// Minimal in-memory DB shim for development/testing.
// Provides the functions expected by server/payments.ts and server/storage.ts.
// IMPORTANT: Replace this with your real DB client (Prisma/Drizzle/knex) for production.

import bcrypt from 'bcrypt';

// Read test account from env; default values if not set
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'tonya.marie.my5@gmail.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'testpass';
const TEST_FIRST = process.env.TEST_USER_FIRST || 'Tonya';
const TEST_LAST = process.env.TEST_USER_LAST || 'Donahoe';

// Simple in-memory storage
const users: any[] = [];
const payments: any[] = [];
const subscriptions: any[] = [];

// Create test user with hashed password on startup
(async () => {
  try {
    const existing = users.find((u) => u.email === TEST_EMAIL);
    if (!existing) {
      const hash = await bcrypt.hash(TEST_PASSWORD, 10);
      users.push({
        id: 'user-dev-1',
        email: TEST_EMAIL,
        passwordHash: hash,
        password_hash: hash,
        first_name: TEST_FIRST,
        last_name: TEST_LAST,
        role: 'student',
        email_verified: true,
        needs_password_setup: false,
        has_paid_access: false,
        created_at: new Date().toISOString(),
      });
      console.log(`[dev db] Created test user ${TEST_EMAIL}`);
    }
  } catch (e) {
    console.error('[dev db] initialization error', e);
  }
})();

// Exported DB helper functions -- adapt these to your real DB client
export const db = {
  async getUserByEmail(email: string) {
    const u = users.filter((x) => String(x.email).toLowerCase() === String(email).toLowerCase());
    return u;
  },

  async getUserById(id: string) {
    const u = users.filter((x) => x.id === id);
    return u;
  },

  async createUser(payload: any) {
    const newUser = {
      id: `user-${Date.now()}`,
      email: payload.email,
      password_hash: payload.passwordHash ?? payload.password_hash ?? null,
      passwordHash: payload.passwordHash ?? payload.password_hash ?? null,
      first_name: payload.firstName ?? payload.first_name ?? null,
      last_name: payload.lastName ?? payload.last_name ?? null,
      role: payload.role ?? 'student',
      email_verified: !!payload.emailVerified,
      needs_password_setup: !!payload.needsPasswordSetup,
      has_paid_access: !!payload.hasPaidAccess,
      created_at: payload.createdAt ?? new Date().toISOString(),
    };
    users.push(newUser);
    return [newUser];
  },

  async updateUserStripeCustomerId(userId: string, stripeCustomerId: string) {
    const u = users.find((x) => x.id === userId);
    if (u) {
      (u as any).stripe_customer_id = stripeCustomerId;
      (u as any).stripeCustomerId = stripeCustomerId;
      return u;
    }
    return null;
  },

  async linkSupabaseUser(userId: string, supabaseUserId: string | null) {
    const u = users.find((x) => x.id === userId);
    if (u) {
      (u as any).supabase_user_id = supabaseUserId;
      return u;
    }
    return null;
  },

  async updateUserPaidStatus(userId: string, data: any) {
    const u = users.find((x) => x.id === userId);
    if (u) {
      if (typeof data.hasPaidAccess !== 'undefined') u.has_paid_access = data.hasPaidAccess;
      if (data.paidAt) u.paid_at = data.paidAt;
      return u;
    }
    return null;
  },

  async setUserPasswordHash(userId: string, hash: string) {
    const u = users.find((x) => x.id === userId);
    if (u) {
      (u as any).password_hash = hash;
      (u as any).passwordHash = hash;
      return u;
    }
    return null;
  },

  async savePasswordSetupToken(userId: string, token: string, expiresAt: string) {
    const u = users.find((x) => x.id === userId);
    if (u) {
      (u as any).password_setup_token = token;
      (u as any).password_setup_token_expires_at = expiresAt;
      return u;
    }
    return null;
  },

  async findPasswordSetupByToken(token: string) {
    const u = users.filter((x) => x.password_setup_token === token);
    return u;
  },

  async clearPasswordSetupToken(userId: string) {
    const u = users.find((x) => x.id === userId);
    if (u) {
      (u as any).password_setup_token = null;
      (u as any).password_setup_token_expires_at = null;
      (u as any).needs_password_setup = false;
      (u as any).email_verified = true;
      return u;
    }
    return null;
  },

  async recordPayment(paymentData: any) {
    const rec = { id: `pay-${Date.now()}`, ...paymentData, created_at: new Date().toISOString() };
    payments.push(rec);
    return [rec];
  },

  async upsertSubscription(sub: any) {
    const existing = subscriptions.find((s) => s.user_id === sub.userId || s.user_id === sub.userId);
    if (existing) {
      Object.assign(existing, {
        status: sub.status,
        plan_type: sub.planType,
        stripe_subscription_id: sub.stripeSubscriptionId,
        current_period_start: sub.currentPeriodStart,
        current_period_end: sub.currentPeriodEnd,
        cancel_at_period_end: sub.cancelAtPeriodEnd ?? false,
      });
      return existing;
    }
    const rec = {
      id: `sub-${Date.now()}`,
      user_id: sub.userId,
      status: sub.status,
      plan_type: sub.planType,
      stripe_subscription_id: sub.stripeSubscriptionId,
      current_period_start: sub.currentPeriodStart,
      current_period_end: sub.currentPeriodEnd,
      cancel_at_period_end: sub.cancelAtPeriodEnd ?? false,
      created_at: new Date().toISOString(),
    };
    subscriptions.push(rec);
    return [rec];
  },

  async getUserSubscription(userId: string) {
    return subscriptions.filter((s) => s.user_id === userId);
  },

  async hasUserPaidAccess(userId: string) {
    return subscriptions.some((s) => s.user_id === userId && s.status === 'active');
  },
};

export { users as schemaUsers, payments as schemaPayments, subscriptions as schemaSubscriptions };
export default { db, users, payments, subscriptions };
